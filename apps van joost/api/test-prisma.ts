/**
 * Prisma Test Script
 * This script tests the Prisma setup and shows you the tables
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testPrisma() {
  try {
    console.log('🚀 Testing Prisma connection...');
    
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Show all tables
    console.log('\n📊 Available tables:');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    console.log(tables);
    
    // Test each model
    console.log('\n🔍 Testing each model:');
    
    // Test User model
    console.log('👤 User model:');
    const userCount = await prisma.user.count();
    console.log(`  - Total users: ${userCount}`);
    
    // Test Patient model
    console.log('🏥 Patient model:');
    const patientCount = await prisma.patient.count();
    console.log(`  - Total patients: ${patientCount}`);
    
    // Test Room model
    console.log('🏠 Room model:');
    const roomCount = await prisma.room.count();
    console.log(`  - Total rooms: ${roomCount}`);
    
    // Test Model model
    console.log('📁 Model model:');
    const modelCount = await prisma.model.count();
    console.log(`  - Total models: ${modelCount}`);
    
    // Test Connection model
    console.log('🔗 Connection model:');
    const connectionCount = await prisma.connection.count();
    console.log(`  - Total connections: ${connectionCount}`);
    
    // Test UserRoom model
    console.log('👥 UserRoom model:');
    const userRoomCount = await prisma.userRoom.count();
    console.log(`  - Total user-room relationships: ${userRoomCount}`);
    
    console.log('\n🎉 All Prisma models are working correctly!');
    
  } catch (error) {
    console.error('❌ Prisma test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testPrisma();
