import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

type GuardKind = 'authenticated' | 'internal' | 'public';

type RouteExpectation = {
  routePath: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  guard: GuardKind;
  expectsUserIdValidation?: boolean;
};

const routes: RouteExpectation[] = [
  {
    routePath: 'src/app/api/subscription/route.ts',
    method: 'GET',
    guard: 'authenticated',
    expectsUserIdValidation: true,
  },
  {
    routePath: 'src/app/api/billing/usage/route.ts',
    method: 'GET',
    guard: 'authenticated',
    expectsUserIdValidation: true,
  },
  {
    routePath: 'src/app/api/set-active-persona/route.ts',
    method: 'POST',
    guard: 'authenticated',
    expectsUserIdValidation: true,
  },
  {
    routePath: 'src/app/api/list-personas/route.ts',
    method: 'GET',
    guard: 'authenticated',
    expectsUserIdValidation: true,
  },
  {
    routePath: 'src/app/api/instagram/persona-message-count/route.ts',
    method: 'GET',
    guard: 'authenticated',
  },
  {
    routePath: 'src/app/api/generate-persona/route.ts',
    method: 'POST',
    guard: 'public',
  },
  {
    routePath: 'src/app/api/save-template/route.ts',
    method: 'POST',
    guard: 'public',
  },
  {
    routePath: 'src/app/api/instagram/simulate-webhook/route.ts',
    method: 'POST',
    guard: 'internal',
  },
  {
    routePath: 'src/app/api/get-user-locale/route.ts',
    method: 'GET',
    guard: 'authenticated',
    expectsUserIdValidation: true,
  },
  {
    routePath: 'src/app/api/telegram/status/route.ts',
    method: 'GET',
    guard: 'authenticated',
    expectsUserIdValidation: true,
  },
  {
    routePath: 'src/app/api/edit-persona/route.ts',
    method: 'PATCH',
    guard: 'authenticated',
    expectsUserIdValidation: true,
  },
  {
    routePath: 'src/app/api/save-persona/route.ts',
    method: 'POST',
    guard: 'authenticated',
    expectsUserIdValidation: true,
  },
  {
    routePath: 'src/app/api/get-persona/route.ts',
    method: 'GET',
    guard: 'authenticated',
  },
  {
    routePath: 'src/app/api/delete-persona/route.ts',
    method: 'DELETE',
    guard: 'authenticated',
  },
  {
    routePath: 'src/app/api/billing/checkout/route.ts',
    method: 'POST',
    guard: 'authenticated',
    expectsUserIdValidation: true,
  },
  {
    routePath: 'src/app/api/delete-user-data/route.ts',
    method: 'DELETE',
    guard: 'authenticated',
    expectsUserIdValidation: true,
  },
  {
    routePath: 'src/app/api/update-user-locale/route.ts',
    method: 'POST',
    guard: 'authenticated',
    expectsUserIdValidation: true,
  },
  {
    routePath: 'src/app/api/telegram-user/request-code/route.ts',
    method: 'POST',
    guard: 'authenticated',
    expectsUserIdValidation: true,
  },
  {
    routePath: 'src/app/api/telegram-user/verify-code/route.ts',
    method: 'POST',
    guard: 'authenticated',
    expectsUserIdValidation: true,
  },
];

function readRouteFile(routePath: string): string {
  const fullPath = path.join(process.cwd(), routePath);
  assert.ok(existsSync(fullPath), `Route file missing: ${routePath}`);
  return readFileSync(fullPath, 'utf8');
}

test('covers all frontend-adjusted API routes', () => {
  assert.equal(routes.length, 19);
});

for (const route of routes) {
  test(`${route.routePath} exports ${route.method}`, () => {
    const source = readRouteFile(route.routePath);
    assert.match(source, new RegExp(`export\\s+async\\s+function\\s+${route.method}\\s*\\(`));
  });

  test(`${route.routePath} uses expected guard (${route.guard})`, () => {
    const source = readRouteFile(route.routePath);
    const hasUserAuthGuard = source.includes('requireAuthenticatedUser');
    const hasInternalGuard = source.includes('requireInternalApiKey');

    if (route.guard === 'authenticated') {
      assert.equal(hasUserAuthGuard, true, 'Missing requireAuthenticatedUser');
      assert.match(source, /if\s*\(\s*auth\.response\s*\)\s*return\s+auth\.response/);
      assert.equal(hasInternalGuard, false, 'Unexpected requireInternalApiKey');
      return;
    }

    if (route.guard === 'internal') {
      assert.equal(hasInternalGuard, true, 'Missing requireInternalApiKey');
      return;
    }

    assert.equal(hasUserAuthGuard, false, 'Public route unexpectedly requires user auth');
  });

  if (route.expectsUserIdValidation) {
    test(`${route.routePath} validates requested userId`, () => {
      const source = readRouteFile(route.routePath);
      assert.equal(source.includes('validateRequestedUserId'), true);
    });
  }
}
