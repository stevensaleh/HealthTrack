// src/pages/StyleGuide.tsx
export default function StyleGuide() {
  return (
    <div className="page-gradient">
      <div className="page-container">
        <h1 className="heading-1 text-center mb-16">HealthHive Style Guide</h1>

        {/* Colors */}
        <section className="mb-20">
          <h2 className="heading-3 mb-8">Colors</h2>
          <div className="flex gap-4 flex-wrap">
            <div className="card" style={{ width: '150px' }}>
              <div
                style={{
                  background: 'var(--color-primary)',
                  height: '80px',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: 'var(--space-3)',
                }}
              ></div>
              <p className="body-sm">Primary</p>
              <p className="body-xs text-muted">#000000</p>
            </div>
            <div className="card" style={{ width: '150px' }}>
              <div
                style={{
                  background: 'var(--color-accent)',
                  height: '80px',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: 'var(--space-3)',
                }}
              ></div>
              <p className="body-sm">Accent</p>
              <p className="body-xs text-muted">#ff8c42</p>
            </div>
            <div className="card" style={{ width: '150px' }}>
              <div
                style={{
                  background: 'var(--color-bg-gradient-start)',
                  border: '1px solid var(--color-border-default)',
                  height: '80px',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: 'var(--space-3)',
                }}
              ></div>
              <p className="body-sm">Background</p>
              <p className="body-xs text-muted">#ffffff</p>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="mb-20">
          <h2 className="heading-3 mb-8">Typography</h2>
          <div className="card mb-6">
            <h1 className="heading-1 mb-4">Heading 1 - 64px</h1>
            <h2 className="heading-2 mb-4">Heading 2 - 48px</h2>
            <h3 className="heading-3 mb-4">Heading 3 - 42px</h3>
            <h4 className="heading-4 mb-4">Heading 4 - 32px</h4>
            <p className="body-lg mb-4">Body Large Text - 20px</p>
            <p className="body-base mb-4">Body Base Text - 16px</p>
            <p className="body-sm">Body Small Text - 15px</p>
          </div>
        </section>

        {/* Buttons */}
        <section className="mb-20">
          <h2 className="heading-3 mb-8">Buttons</h2>
          
          {/* Primary Buttons */}
          <div className="card mb-6">
            <h3 className="heading-6 mb-4">Primary Buttons</h3>
            <div className="flex gap-4 mb-4 flex-wrap">
              <button className="btn-primary btn-lg">Primary Large</button>
              <button className="btn-primary btn-md">Primary Medium</button>
              <button className="btn-primary btn-sm">Primary Small</button>
            </div>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`<button className="btn-primary btn-lg">Primary Large</button>
<button className="btn-primary btn-md">Primary Medium</button>
<button className="btn-primary btn-sm">Primary Small</button>`}
            </pre>
          </div>

          {/* Button Variants */}
          <div className="card mb-6">
            <h3 className="heading-6 mb-4">Button Variants</h3>
            <div className="flex gap-4 mb-4 flex-wrap">
              <button className="btn-primary btn-md">Primary</button>
              <button className="btn-secondary btn-md">Secondary</button>
              <button className="btn-ghost btn-md">Ghost</button>
            </div>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`<button className="btn-primary btn-md">Primary</button>
<button className="btn-secondary btn-md">Secondary</button>
<button className="btn-ghost btn-md">Ghost</button>`}
            </pre>
          </div>

          {/* Full Width Button */}
          <div className="card">
            <h3 className="heading-6 mb-4">Full Width Button</h3>
            <button className="btn-primary btn-md btn-full mb-4">Full Width Button</button>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`<button className="btn-primary btn-md btn-full">Full Width Button</button>`}
            </pre>
          </div>
        </section>

        {/* Forms */}
        <section className="mb-20">
          <h2 className="heading-3 mb-8">Form Elements</h2>
          <div className="card" style={{ maxWidth: '500px' }}>
            <div className="form-group">
              <label className="input-label">Email Address</label>
              <input
                type="email"
                className="input-field"
                placeholder="Enter your email"
              />
            </div>
            <div className="form-group">
              <label className="input-label">Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="Enter your password"
              />
            </div>
            <div className="error-message mb-4">This is an error message</div>
            <div className="success-message">This is a success message</div>
          </div>
        </section>

        {/* Cards */}
        <section className="mb-20">
          <h2 className="heading-3 mb-8">Cards</h2>
          <div className="flex gap-6 flex-wrap">
            <div className="card" style={{ width: '250px' }}>
              <h3 className="heading-6 mb-4">Default Card</h3>
              <p className="body-sm">This is a default card with standard styling and rounded corners.</p>
            </div>
            <div className="card card-elevated" style={{ width: '250px' }}>
              <h3 className="heading-6 mb-4">Elevated Card</h3>
              <p className="body-sm">This card has a larger shadow for more emphasis.</p>
            </div>
          </div>
        </section>

        {/* Spacing */}
        <section className="mb-20">
          <h2 className="heading-3 mb-8">Spacing Scale</h2>
          <div className="card">
            <p className="body-base mb-4">HealthHive uses a consistent spacing scale:</p>
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <div style={{ width: '100px' }} className="body-sm text-muted">space-1</div>
                <div style={{ width: 'var(--space-1)', height: '20px', background: 'var(--color-accent)' }}></div>
                <span className="body-sm">4px</span>
              </div>
              <div className="flex items-center gap-4">
                <div style={{ width: '100px' }} className="body-sm text-muted">space-2</div>
                <div style={{ width: 'var(--space-2)', height: '20px', background: 'var(--color-accent)' }}></div>
                <span className="body-sm">8px</span>
              </div>
              <div className="flex items-center gap-4">
                <div style={{ width: '100px' }} className="body-sm text-muted">space-4</div>
                <div style={{ width: 'var(--space-4)', height: '20px', background: 'var(--color-accent)' }}></div>
                <span className="body-sm">16px</span>
              </div>
              <div className="flex items-center gap-4">
                <div style={{ width: '100px' }} className="body-sm text-muted">space-8</div>
                <div style={{ width: 'var(--space-8)', height: '20px', background: 'var(--color-accent)' }}></div>
                <span className="body-sm">32px</span>
              </div>
            </div>
          </div>
        </section>

        {/* Border Radius */}
        <section className="mb-20">
          <h2 className="heading-3 mb-8">Border Radius</h2>
          <div className="flex gap-6 flex-wrap">
            <div className="card text-center" style={{ width: '150px' }}>
              <div
                style={{
                  width: '100px',
                  height: '100px',
                  background: 'var(--color-accent)',
                  borderRadius: 'var(--radius-sm)',
                  margin: '0 auto var(--space-4)',
                }}
              ></div>
              <p className="body-sm">Small (8px)</p>
            </div>
            <div className="card text-center" style={{ width: '150px' }}>
              <div
                style={{
                  width: '100px',
                  height: '100px',
                  background: 'var(--color-accent)',
                  borderRadius: 'var(--radius-md)',
                  margin: '0 auto var(--space-4)',
                }}
              ></div>
              <p className="body-sm">Medium (10px)</p>
            </div>
            <div className="card text-center" style={{ width: '150px' }}>
              <div
                style={{
                  width: '100px',
                  height: '100px',
                  background: 'var(--color-accent)',
                  borderRadius: 'var(--radius-lg)',
                  margin: '0 auto var(--space-4)',
                }}
              ></div>
              <p className="body-sm">Large (20px)</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}