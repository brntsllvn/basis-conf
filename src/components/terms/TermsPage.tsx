import './TermsPage.css';

export function TermsPage() {
  return (
    <div className="terms-root">
      <header className="terms-header">
        <a href="/northwest-2026" className="terms-back">← Basis Northwest 2026</a>
        <h1 className="terms-title">Terms of Attendance</h1>
        <p className="terms-subtitle">Basis Northwest 2026 · Basis Live, LLC</p>
      </header>

      <main className="terms-body">
        <section className="terms-section">
          <h2 className="terms-heading">Registration and Fees</h2>
          <p>Registration provides event access only. All applicable fees are due at the time of registration. Travel, lodging, and meals remain the attendee's responsibility.</p>
        </section>

        <section className="terms-section">
          <h2 className="terms-heading">Refund Policy</h2>
          <p>Early Bird tickets ($479) are non-refundable. Standard tickets ($829) are eligible for a full refund minus a $100 processing fee if cancelled 30 or more days prior to the event. Cancellations within 30 days of the event are non-refundable.</p>
        </section>

        <section className="terms-section">
          <h2 className="terms-heading">Conduct</h2>
          <p>Attendees are expected to treat all participants with respect. The Organizer reserves the right to deny admission to or remove any individual who violates these standards.</p>
        </section>

        <section className="terms-section">
          <h2 className="terms-heading">Media and Photography</h2>
          <p>By attending, you authorize the Organizer to record, photograph, film, or otherwise capture your likeness for promotional use without compensation. Recording of sessions requires prior written consent from the Organizer. Personal photography in common areas is permitted.</p>
        </section>

        <section className="terms-section">
          <h2 className="terms-heading">Data Sharing</h2>
          <p>Attendee names, companies, and titles may be shared with other attendees and sponsors. You may opt out of this data sharing without affecting your admission to the event.</p>
        </section>

        <section className="terms-section">
          <h2 className="terms-heading">Liability</h2>
          <p>The Organizer's liability is limited to the registration fee paid. The event is provided on an as-is basis. Basis Live, LLC is not liable for any incidental, consequential, or indirect damages arising from attendance.</p>
        </section>

        <section className="terms-section">
          <h2 className="terms-heading">Force Majeure</h2>
          <p>In the event of cancellation due to circumstances beyond the Organizer's reasonable control, attendees will receive a full refund of fees paid.</p>
        </section>

        <section className="terms-section">
          <h2 className="terms-heading">Governing Law</h2>
          <p>These terms are governed by the laws of the State of Washington. Any disputes shall be resolved under the jurisdiction of King County, Washington.</p>
        </section>

        <p className="terms-footer-note">Questions? Contact <a href="/northwest-2026">Basis Live, LLC</a> through the event website.</p>
      </main>

      <footer className="terms-page-footer">
        <span>© 2026 Basis Live, LLC</span>
      </footer>
    </div>
  );
}
