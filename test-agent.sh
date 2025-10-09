#!/bin/bash

# Pet Store Agent Testing Script
# Run this script to automatically test the new agent functionality

echo "🧪 Starting Pet Store Agent Tests..."
echo "=================================="

BASE_URL="http://localhost:3000"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to make HTTP requests and show results
test_request() {
    local method=$1
    local url=$2
    local data=$3
    local description=$4
    
    echo -e "\n${BLUE}Testing: $description${NC}"
    echo "Request: $method $url"
    
    if [ -n "$data" ]; then
        echo "Data: $data"
        response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X $method "$BASE_URL$url" \
            -H "Content-Type: application/json" \
            -d "$data")
    else
        response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X $method "$BASE_URL$url")
    fi
    
    http_status=$(echo "$response" | grep "HTTP_STATUS" | cut -d: -f2)
    body=$(echo "$response" | sed '/HTTP_STATUS/d')
    
    if [ "$http_status" -ge 200 ] && [ "$http_status" -lt 300 ]; then
        echo -e "${GREEN}✅ Success ($http_status)${NC}"
        echo "$body" | jq . 2>/dev/null || echo "$body"
    else
        echo -e "${RED}❌ Failed ($http_status)${NC}"
        echo "$body"
    fi
}

echo -e "\n${YELLOW}Step 1: Creating test pets...${NC}"

# Create test pets
test_request "POST" "/ts/pets" '{
    "name": "Buddy",
    "species": "dog", 
    "breed": "Golden Retriever",
    "age": 2,
    "status": "available"
}' "Create young dog (Buddy)"

test_request "POST" "/js/pets" '{
    "name": "Whiskers",
    "species": "cat",
    "breed": "Persian", 
    "age": 5,
    "status": "available"
}' "Create older cat (Whiskers)"

test_request "POST" "/py/pets" '{
    "name": "Charlie",
    "species": "dog",
    "breed": "Labrador",
    "age": 4, 
    "status": "available"
}' "Create middle-aged dog (Charlie)"

test_request "POST" "/ts/pets" '{
    "name": "Luna",
    "species": "cat",
    "breed": "Siamese",
    "age": 1,
    "status": "available"
}' "Create young cat (Luna)"

test_request "POST" "/js/pets" '{
    "name": "Max",
    "species": "dog", 
    "breed": "Beagle",
    "age": 3,
    "status": "adopted"
}' "Create adopted dog (Max - should not appear in recommendations)"

echo -e "\n${YELLOW}Step 2: Testing recommendation endpoints...${NC}"

# Test recommendations
test_request "POST" "/ts/recommendations" '{
    "species": "dog",
    "maxAge": 5
}' "TypeScript: Dog recommendations (max age 5)"

test_request "POST" "/js/recommendations" '{
    "species": "cat", 
    "maxAge": 3
}' "JavaScript: Cat recommendations (max age 3)"

test_request "POST" "/py/recommendations" '{
    "breed": "Golden",
    "maxAge": 4
}' "Python: Golden breed recommendations"

# Test error case
test_request "POST" "/ts/recommendations" '{}' "TypeScript: Empty preferences (should fail)"

echo -e "\n${YELLOW}Step 3: Testing cross-language consistency...${NC}"

# Test same preferences across all languages
test_request "POST" "/ts/recommendations" '{
    "species": "cat"
}' "TypeScript: Cat preferences"

test_request "POST" "/js/recommendations" '{
    "species": "cat"
}' "JavaScript: Cat preferences"

test_request "POST" "/py/recommendations" '{
    "species": "cat"
}' "Python: Cat preferences"

echo -e "\n${YELLOW}Step 4: Testing adoption workflow with summaries...${NC}"

# Get a pet ID for adoption testing
echo "Getting pet list to find a pet ID..."
pets_response=$(curl -s "$BASE_URL/ts/pets")
pet_id=$(echo "$pets_response" | jq -r '.[0].id' 2>/dev/null)

if [ "$pet_id" != "null" ] && [ -n "$pet_id" ]; then
    echo "Using pet ID: $pet_id"
    
    test_request "POST" "/ts/adoptions/apply" "{
        \"petId\": \"$pet_id\",
        \"adopterName\": \"Alice Johnson\",
        \"adopterEmail\": \"alice@example.com\"
    }" "TypeScript: Successful adoption application (watch for summary generation)"
    
    echo -e "\n${BLUE}⏳ Waiting for workflow to complete (background check + summary)...${NC}"
    sleep 3
    
    # Test failed adoption
    pets_response=$(curl -s "$BASE_URL/js/pets")
    pet_id2=$(echo "$pets_response" | jq -r '.[1].id' 2>/dev/null)
    
    if [ "$pet_id2" != "null" ] && [ -n "$pet_id2" ]; then
        test_request "POST" "/js/adoptions/apply" "{
            \"petId\": \"$pet_id2\",
            \"adopterName\": \"Spam User\",
            \"adopterEmail\": \"spam@example.com\"
        }" "JavaScript: Failed adoption application (spam email)"
    fi
else
    echo -e "${RED}❌ Could not get pet ID for adoption testing${NC}"
fi

echo -e "\n${YELLOW}Step 5: Testing edge cases...${NC}"

test_request "POST" "/ts/recommendations" '{
    "species": "bird",
    "maxAge": 1
}' "No matching pets (bird species)"

test_request "POST" "/js/recommendations" '{
    "species": "dog",
    "maxAge": 1,
    "minAge": 10
}' "Impossible criteria (min age > max age)"

echo -e "\n${GREEN}🎉 Testing Complete!${NC}"
echo "=================================="
echo -e "${BLUE}What to check:${NC}"
echo "1. ✅ Recommendations return scored matches with reasons"
echo "2. ✅ Cross-language results are consistent"  
echo "3. ✅ Error cases handled gracefully"
echo "4. ✅ Adoption workflow includes summary generation"
echo "5. ✅ Console logs show: '📝 Generating application summary...'"
echo "6. ✅ Console logs show: '✨ Summary: \"...\"'"
echo ""
echo -e "${YELLOW}Optional: Set OPENAI_API_KEY to test AI enhancement${NC}"
echo "export OPENAI_API_KEY=your_key_here"
echo ""
echo -e "${BLUE}Check the Motia workbench UI to see the new workflow steps!${NC}"