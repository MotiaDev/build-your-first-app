#!/usr/bin/env node

// Test script for SSE streaming functionality
const http = require('http');

const testSSE = (port, path, name) => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      name: name,
      species: 'dog',
      ageMonths: 12
    });

    const options = {
      hostname: 'localhost',
      port: port,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Accept': 'text/event-stream'
      }
    };

    const req = http.request(options, (res) => {
      console.log(`\n🧪 Testing ${name} - Status: ${res.statusCode}`);
      console.log(`📡 Headers: ${JSON.stringify(res.headers, null, 2)}`);
      
      if (res.headers['content-type'] !== 'text/event-stream') {
        console.log(`❌ Expected text/event-stream, got: ${res.headers['content-type']}`);
        resolve(false);
        return;
      }

      let eventCount = 0;
      let events = [];

      res.on('data', (chunk) => {
        const data = chunk.toString();
        console.log(`📦 Received chunk: ${data}`);
        
        // Parse SSE events
        const lines = data.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const eventData = JSON.parse(line.substring(6));
              events.push(eventData);
              eventCount++;
              console.log(`✅ Event ${eventCount}: ${JSON.stringify(eventData, null, 2)}`);
            } catch (e) {
              console.log(`⚠️ Failed to parse event: ${line}`);
            }
          }
        }
      });

      res.on('end', () => {
        console.log(`\n🏁 Stream ended. Total events: ${eventCount}`);
        
        // Verify expected events
        const expectedEvents = [
          { type: 'status', value: 'new' },
          { type: 'status', value: 'in_quarantine' },
          { type: 'enrichment.started' },
          // enrichment.progress events (4 of them)
          // enrichment.completed event
        ];
        
        let success = true;
        if (events.length < 6) {
          console.log(`❌ Expected at least 6 events, got ${events.length}`);
          success = false;
        }
        
        if (events[0]?.type !== 'status' || events[0]?.value !== 'new') {
          console.log(`❌ First event should be status:new, got: ${JSON.stringify(events[0])}`);
          success = false;
        }
        
        if (events[1]?.type !== 'status' || events[1]?.value !== 'in_quarantine') {
          console.log(`❌ Second event should be status:in_quarantine, got: ${JSON.stringify(events[1])}`);
          success = false;
        }
        
        if (events[2]?.type !== 'enrichment.started') {
          console.log(`❌ Third event should be enrichment.started, got: ${JSON.stringify(events[2])}`);
          success = false;
        }
        
        const lastEvent = events[events.length - 1];
        if (lastEvent?.type !== 'enrichment.completed') {
          console.log(`❌ Last event should be enrichment.completed, got: ${JSON.stringify(lastEvent)}`);
          success = false;
        }
        
        if (success) {
          console.log(`✅ ${name} SSE test PASSED`);
        } else {
          console.log(`❌ ${name} SSE test FAILED`);
        }
        
        resolve(success);
      });

      res.on('error', (err) => {
        console.log(`❌ ${name} request error: ${err.message}`);
        reject(err);
      });
    });

    req.on('error', (err) => {
      console.log(`❌ ${name} connection error: ${err.message}`);
      reject(err);
    });

    req.write(postData);
    req.end();
  });
};

const runTests = async () => {
  console.log('🚀 Starting SSE Streaming Tests...\n');
  
  const tests = [
    { port: 3000, path: '/ts/pets', name: 'TypeScript' },
    { port: 3000, path: '/js/pets', name: 'JavaScript' },
    { port: 3000, path: '/py/pets', name: 'Python' }
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      const result = await testSSE(test.port, test.path, test.name);
      results.push({ name: test.name, success: result });
    } catch (error) {
      console.log(`❌ ${test.name} test failed with error: ${error.message}`);
      results.push({ name: test.name, success: false });
    }
    
    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  
  let allPassed = true;
  for (const result of results) {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${result.name}: ${status}`);
    if (!result.success) allPassed = false;
  }
  
  console.log('\n' + (allPassed ? '🎉 All tests PASSED!' : '💥 Some tests FAILED!'));
  process.exit(allPassed ? 0 : 1);
};

// Check if server is running
const checkServer = () => {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET'
    }, (res) => {
      resolve(true);
    });
    
    req.on('error', () => {
      resolve(false);
    });
    
    req.end();
  });
};

const main = async () => {
  console.log('🔍 Checking if Motia server is running on port 3000...');
  
  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.log('❌ Server not running. Please start the Motia server first:');
    console.log('   npm start');
    console.log('   # or');
    console.log('   motia dev');
    process.exit(1);
  }
  
  console.log('✅ Server is running. Starting tests...\n');
  await runTests();
};

main().catch(console.error);


