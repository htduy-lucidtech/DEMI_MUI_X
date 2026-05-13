/// <reference types="@testing-library/jest-dom" />
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HasPermission from '@/components/common/HasPermission';
import { useAuth } from '@/app/context/AuthContext';

// Mock the useAuth hook
vi.mock('@/app/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('HasPermission Component', () => {
  it('renders children when user is Admin', () => {
    (useAuth as any).mockReturnValue({
      activeRole: 'Admin',
      hasPermission: vi.fn().mockReturnValue(false),
    });

    render(
      <HasPermission permission="SOME_PERMISSION">
        <div data-testid="content">Protected Content</div>
      </HasPermission>
    );

    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('renders children when user has the specific permission', () => {
    (useAuth as any).mockReturnValue({
      activeRole: 'Employee',
      hasPermission: vi.fn((p: string) => p === 'READ_STUFF'),
    });

    render(
      <HasPermission permission="READ_STUFF">
        <div data-testid="content">Protected Content</div>
      </HasPermission>
    );

    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('renders fallback when user does not have permission', () => {
    (useAuth as any).mockReturnValue({
      activeRole: 'Employee',
      hasPermission: vi.fn().mockReturnValue(false),
    });

    render(
      <HasPermission
        permission="ADMIN_ONLY"
        fallback={<div data-testid="fallback">Access Denied</div>}
      >
        <div data-testid="content">Protected Content</div>
      </HasPermission>
    );

    expect(screen.queryByTestId('content')).not.toBeInTheDocument();
    expect(screen.getByTestId('fallback')).toBeInTheDocument();
  });

  it('renders children when one of multiple permissions matches (OR operator)', () => {
    (useAuth as any).mockReturnValue({
      activeRole: 'Employee',
      hasPermission: vi.fn((p: string) => p === 'PERMISSION_B'),
    });

    render(
      <HasPermission permissions={['PERMISSION_A', 'PERMISSION_B']} operator="OR">
        <div data-testid="content">Protected Content</div>
      </HasPermission>
    );

    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('does not render children when NOT all permissions match (AND operator)', () => {
    (useAuth as any).mockReturnValue({
      activeRole: 'Employee',
      hasPermission: vi.fn((p: string) => p === 'PERMISSION_A'),
    });

    render(
      <HasPermission permissions={['PERMISSION_A', 'PERMISSION_B']} operator="AND">
        <div data-testid="content">Protected Content</div>
      </HasPermission>
    );

    expect(screen.queryByTestId('content')).not.toBeInTheDocument();
  });
});
