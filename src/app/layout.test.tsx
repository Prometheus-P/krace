// src/app/layout.test.tsx
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import RootLayout from './layout';
import Script from 'next/script';

// Mock the Vercel Analytics component
jest.mock('@vercel/analytics/react', () => ({
  Analytics: () => <div data-testid="vercel-analytics" />,
}));

// Mock the next/script component
jest.mock('next/script', () => {
  const MockScript = (props: any) => {
    return <script {...props} />;
  };
  return MockScript;
});


describe('RootLayout', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV }; // Make a copy
    (Script as jest.Mock).mockClear();
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  it('should render Header, Footer, children, and Analytics', () => {
    render(
      <RootLayout>
        <main>
          <p>Main Content</p>
        </main>
      </RootLayout>
    );

    // Check for Header content
    const header = screen.getByRole('banner');
    expect(within(header).getByText(/KRace/i)).toBeInTheDocument();

    // Check for Footer content
    expect(screen.getByText(/본 서비스는 정보 제공 목적이며/i)).toBeInTheDocument();

    // Check for children content
    expect(screen.getByText(/Main Content/i)).toBeInTheDocument();

    // Check for Vercel Analytics component
    expect(screen.getByTestId('vercel-analytics')).toBeInTheDocument();
  });

  it('should render Google Analytics scripts when GA_ID is provided', () => {
    process.env.NEXT_PUBLIC_GA_ID = 'G-TEST12345';

    render(
      <RootLayout>
        <main>
          <p>Main Content</p>
        </main>
      </RootLayout>
    );

    // Expect the Script component to have been called twice
    expect(Script).toHaveBeenCalledTimes(2);

    // Check the props of the first call (gtag.js)
    expect(Script).toHaveBeenCalledWith(
      expect.objectContaining({
        src: 'https://www.googletagmanager.com/gtag/js?id=G-TEST12345',
      }),
      expect.anything()
    );

    // Check the props of the second call (inline script)
    expect(Script).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'google-analytics',
        children: expect.stringContaining("gtag('config', 'G-TEST12345')"),
      }),
      expect.anything()
    );
  });

  it('should not render Google Analytics scripts when GA_ID is not provided', () => {
    delete process.env.NEXT_PUBLIC_GA_ID;

    render(
      <RootLayout>
        <main>
          <p>Main Content</p>
        </main>
      </RootLayout>
    );

    expect(Script).not.toHaveBeenCalled();
  });
});