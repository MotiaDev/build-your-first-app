# steps/python/adoption_decision.step.py
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from services import pet_store
import time
import random

config = {
    "type": "event",
    "name": "PyWorkflowDecision",
    "description": "Workflow gateway that decides to approve, reject, or escalate based on background check and summary",
    "subscribes": ["py.adoption.background.complete", "py.adoption.summary.complete"],
    "emits": ["py.adoption.approved", "py.adoption.rejected", "py.adoption.escalate"],
    "flows": ["python-adoptions"]
}

# Track completion of parallel processes per application
application_state = {}

async def handler(event, ctx=None):
    if not ctx:
        return
        
    application_id = (event or {}).get("applicationId")
    pet_id = (event or {}).get("petId")
    adopter_name = (event or {}).get("adopterName")
    adopter_email = (event or {}).get("adopterEmail")

    ctx.logger.info("⚖️ Processing workflow decision input", {
        "applicationId": application_id,
        "petId": pet_id
    })

    try:
        # Determine which process completed based on event data
        is_background_complete = (event or {}).get("checkResult") is not None
        is_summary_complete = (event or {}).get("summary") is not None

        # Get or create application state
        app_state = application_state.get(application_id, {})

        # Update state based on completed process
        if is_background_complete:
            app_state["backgroundComplete"] = {
                "checkResult": event.get("checkResult"),
                "checkDetails": event.get("checkDetails"),
                "completedAt": time.time()
            }
            ctx.logger.info("Background check completed for application", {"applicationId": application_id})

        if is_summary_complete:
            app_state["summaryComplete"] = {
                "summary": event.get("summary"),
                "completedAt": time.time()
            }
            ctx.logger.info("Summary generation completed for application", {"applicationId": application_id})

        # Save updated state
        application_state[application_id] = app_state

        # Check if both processes are complete
        if not app_state.get("backgroundComplete") or not app_state.get("summaryComplete"):
            ctx.logger.info("Waiting for parallel processes to complete", {
                "applicationId": application_id,
                "backgroundComplete": bool(app_state.get("backgroundComplete")),
                "summaryComplete": bool(app_state.get("summaryComplete"))
            })
            return  # Wait for the other process

        # Both processes complete - make decision
        ctx.logger.info("🎯 Making workflow decision - both processes complete", {
            "applicationId": application_id,
            "petId": pet_id
        })

        check_result = app_state["backgroundComplete"]["checkResult"]
        check_details = app_state["backgroundComplete"]["checkDetails"]
        summary = app_state["summaryComplete"]["summary"]

        # Decision logic
        decision = "approve"
        reason = "Application meets all criteria"

        # Check for automatic rejection
        if check_result == "failed":
            decision = "reject"
            reason = f"Background check failed: {check_details}"
        elif check_result == "error":
            decision = "escalate"
            reason = "Background check encountered errors, requires review"

        # Check for escalation conditions
        if decision == "approve":
            # Check for escalation triggers in summary
            if summary and any(word in summary.lower() for word in ["concern", "risk", "issue"]):
                decision = "escalate"
                reason = "Summary indicates potential concerns requiring review"

            # Check pet characteristics that might require escalation
            pet = pet_store.get(pet_id)
            if pet:
                pet_age = pet.get("ageMonths", 0) // 12
                if pet_age > 10:
                    decision = "escalate"
                    reason = "Senior pet adoption requires additional assessment"
                if pet.get("species") in ["bird", "exotic"]:
                    decision = "escalate"
                    reason = "Exotic pet adoption requires specialized assessment"

        # Random escalation for demonstration (10% chance)
        if decision == "approve" and random.random() < 0.1:
            decision = "escalate"
            reason = "Random quality assurance review"

        ctx.logger.info("Workflow decision made", {
            "applicationId": application_id,
            "petId": pet_id,
            "decision": decision,
            "reason": reason,
            "checkResult": check_result,
            "summaryLength": len(summary) if summary else 0
        })

        # Execute decision
        if decision == "approve":
            # Mark pet as adopted
            pet = pet_store.get(pet_id)
            if pet:
                pet_store.update(pet_id, {"status": "adopted"})

            # Update stream
            if hasattr(ctx, 'streams') and ctx.streams and ctx.trace_id:
                await ctx.streams.adoptions.set(ctx.trace_id, "decision", {
                    "entityId": application_id,
                    "type": "decision",
                    "phase": "approved",
                    "message": f"Application approved: {reason}",
                    "timestamp": int(time.time() * 1000),
                    "data": {"petId": pet_id, "adopterName": adopter_name, "decision": decision, "reason": reason}
                })

                await ctx.streams.adoptions.set(ctx.trace_id, "pet_status", {
                    "entityId": pet_id,
                    "type": "pet",
                    "phase": "adopted",
                    "message": "Pet successfully adopted",
                    "timestamp": int(time.time() * 1000),
                    "data": {"petName": pet.get("name") if pet else None}
                })

            # Emit approval
            await ctx.emit({
                "topic": "py.adoption.approved",
                "data": {
                    "applicationId": application_id,
                    "petId": pet_id,
                    "adopterName": adopter_name,
                    "adopterEmail": adopter_email,
                    "reason": reason,
                    "checkResult": check_result,
                    "summary": summary,
                    "traceId": ctx.trace_id
                }
            })

        elif decision == "reject":
            # Update stream
            if hasattr(ctx, 'streams') and ctx.streams and ctx.trace_id:
                await ctx.streams.adoptions.set(ctx.trace_id, "decision", {
                    "entityId": application_id,
                    "type": "decision",
                    "phase": "rejected",
                    "message": f"Application rejected: {reason}",
                    "timestamp": int(time.time() * 1000),
                    "data": {"petId": pet_id, "adopterName": adopter_name, "decision": decision, "reason": reason}
                })

            # Emit rejection
            await ctx.emit({
                "topic": "py.adoption.rejected",
                "data": {
                    "applicationId": application_id,
                    "petId": pet_id,
                    "adopterName": adopter_name,
                    "adopterEmail": adopter_email,
                    "rejectionReason": reason,
                    "checkResult": check_result,
                    "checkDetails": check_details,
                    "summary": summary,
                    "traceId": ctx.trace_id
                }
            })

        elif decision == "escalate":
            # Update stream
            if hasattr(ctx, 'streams') and ctx.streams and ctx.trace_id:
                await ctx.streams.adoptions.set(ctx.trace_id, "decision", {
                    "entityId": application_id,
                    "type": "decision",
                    "phase": "escalated",
                    "message": f"Application escalated: {reason}",
                    "timestamp": int(time.time() * 1000),
                    "data": {"petId": pet_id, "adopterName": adopter_name, "decision": decision, "reason": reason}
                })

            # Emit escalation for risk assessment
            await ctx.emit({
                "topic": "py.adoption.escalate",
                "data": {
                    "applicationId": application_id,
                    "petId": pet_id,
                    "adopterName": adopter_name,
                    "adopterEmail": adopter_email,
                    "escalationReason": reason,
                    "checkResult": check_result,
                    "checkDetails": check_details,
                    "summary": summary,
                    "traceId": ctx.trace_id
                }
            })

        # Clean up application state
        if application_id in application_state:
            del application_state[application_id]

    except Exception as error:
        ctx.logger.error("Workflow decision failed", {
            "applicationId": application_id,
            "petId": pet_id,
            "error": str(error)
        })

        # Default to escalation on error
        await ctx.emit({
            "topic": "py.adoption.escalate",
            "data": {
                "applicationId": application_id,
                "petId": pet_id,
                "adopterName": adopter_name,
                "adopterEmail": adopter_email,
                "escalationReason": f"Decision process error: {str(error)}",
                "error": str(error),
                "traceId": ctx.trace_id
            }
        })

        # Clean up
        if application_id in application_state:
            del application_state[application_id]