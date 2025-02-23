import { NextResponse } from 'next/server';
import { PostgresUserService } from '@/lib/db/postgres/userService';
import { verifyPassword } from '@/lib/auth/password';
import { generateToken } from '@/lib/auth/jwt';

export async function GET() {
  try {
    const testResults: Record<string, any> = {};
    const userService = new PostgresUserService();

    // Test data
    const testUser = {
      username: 'testuser_' + Date.now(),
      email: `test${Date.now()}@example.com`,
      password: 'testpassword123',
      name: 'Test User'
    };

    // 1. Test User Registration
    const user = await userService.createUser(testUser);
    testResults.registration = {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        status: user.status
      }
    };

    // 2. Test User Lookup
    const foundById = await userService.findById(user.id);
    const foundByUsername = await userService.findByUsername(user.username);
    const foundByEmail = await userService.findByEmail(user.email);

    testResults.lookup = {
      byId: foundById !== null,
      byUsername: foundByUsername !== null,
      byEmail: foundByEmail !== null
    };

    // 3. Test Password Verification
    const isValidPassword = await verifyPassword(testUser.password, user.password_hash);
    testResults.passwordVerification = {
      success: isValidPassword
    };

    // 4. Test JWT Token Generation
    const token = generateToken(user);
    testResults.tokenGeneration = {
      success: token !== null,
      token: token
    };

    // 5. Test Profile Update
    const updatedName = 'Updated Test User';
    await userService.updateProfile(user.id, { name: updatedName });
    const updatedUser = await userService.findById(user.id);
    testResults.profileUpdate = {
      success: updatedUser?.name === updatedName
    };

    // 6. Test Status Update
    await userService.updateStatus(user.id, 'inactive');
    const inactiveUser = await userService.findById(user.id);
    testResults.statusUpdate = {
      success: inactiveUser?.status === 'inactive'
    };

    // 7. Test Duplicate Prevention
    try {
      await userService.createUser(testUser);
      testResults.duplicatePrevention = {
        success: false,
        error: 'Failed to prevent duplicate user'
      };
    } catch (error: any) {
      testResults.duplicatePrevention = {
        success: true,
        error: error.message
      };
    }

    // 8. Clean up
    await userService.deleteUser(user.id);
    const deletedUser = await userService.findById(user.id);
    testResults.cleanup = {
      success: deletedUser === null
    };

    return NextResponse.json({
      success: true,
      message: 'PostgreSQL user service tests completed successfully',
      results: testResults
    });

  } catch (error: any) {
    console.error('PostgreSQL user service test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
} 