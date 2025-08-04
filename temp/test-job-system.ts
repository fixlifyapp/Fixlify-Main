// Test script to verify job system
import { Job, JobStatus, isValidJobStatus, validateJob } from './src/types/job.ts';

console.log('Testing Job System...');

// Test 1: Check JobStatus enum
console.log('\n1. JobStatus Enum Values:');
Object.entries(JobStatus).forEach(([key, value]) => {
  console.log(`  ${key}: ${value}`);
});

// Test 2: Check status validation
console.log('\n2. Status Validation:');
console.log('  Valid status "completed":', isValidJobStatus('completed'));
console.log('  Invalid status "Completed":', isValidJobStatus('Completed'));

// Test 3: Create a test job
const testJob = {
  id: 'J-TEST-001',
  client_id: 'C-TEST-001',
  created_by: null,
  user_id: 'user-123',
  title: 'Test Job',
  description: 'Testing the job system',
  status: JobStatus.SCHEDULED,
  service: 'Test Service',
  job_type: 'Repair',
  lead_source: 'Website',
  date: new Date().toISOString(),
  schedule_start: null,
  schedule_end: null,
  revenue: 150.00,
  technician_id: null,
  property_id: null,
  address: '123 Test St',
  tags: ['test', 'system'],
  notes: 'Test notes',
  tasks: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  deleted_at: null,
  created_by_automation: null,
  automation_triggered_at: null,
  organization_id: null
};

// Test 4: Validate job
console.log('\n3. Job Validation:');
try {
  const validatedJob = validateJob(testJob);
  console.log('  ✅ Job validated successfully');
  console.log('  Revenue:', validatedJob.revenue);
  console.log('  Status:', validatedJob.status);
} catch (error) {
  console.error('  ❌ Validation failed:', error);
}

console.log('\n✅ Job system test complete!');
