// Footer Component - Injected into all pages
(function(){
  const footer = document.createElement('footer');
  footer.style.cssText = `
    background: var(--black-light);
    border-top: 1px solid var(--border);
    padding: 40px 30px 20px;
    margin-top: 60px;
    position: relative;
    z-index: 1;
  `;
  
  const year = new Date().getFullYear();
  
  footer.innerHTML = `
    <div style="max-width: 1400px; margin: 0 auto;">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 30px; margin-bottom: 30px;">
        <div>
          <div style="font-family: 'Cinzel', serif; color: var(--gold); font-size: 1.1em; margin-bottom: 12px; letter-spacing: 2px;">FUTURE STARS</div>
          <p style="color: var(--gray); font-size: 0.85em; line-height: 1.7;">Elite sports merchandise for the next generation of champions.</p>
        </div>
        <div>
          <div style="font-family: 'Cinzel', serif; color: var(--white); font-size: 0.85em; margin-bottom: 12px; letter-spacing: 1px;">QUICK LINKS</div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <a href="dashboard.html" style="color: var(--gray); text-decoration: none; font-size: 0.85em; transition: color 0.2s;">Dashboard</a>
            <a href="tournaments.html" style="color: var(--gray); text-decoration: none; font-size: 0.85em; transition: color 0.2s;">Tournaments</a>
            <a href="inventory.html" style="color: var(--gray); text-decoration: none; font-size: 0.85em; transition: color 0.2s;">Inventory</a>
            <a href="trips.html" style="color: var(--gray); text-decoration: none; font-size: 0.85em; transition: color 0.2s;">Trips</a>
          </div>
        </div>
        <div>
          <div style="font-family: 'Cinzel', serif; color: var(--white); font-size: 0.85em; margin-bottom: 12px; letter-spacing: 1px;">TOOLS</div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <a href="pj-planner.html" style="color: var(--gray); text-decoration: none; font-size: 0.85em; transition: color 0.2s;">Trip Planner</a>
            <a href="trip-tracker.html" style="color: var(--gray); text-decoration: none; font-size: 0.85em; transition: color 0.2s;">Trip Tracker</a>
            <a href="trip-plans.html" style="color: var(--gray); text-decoration: none; font-size: 0.85em; transition: color 0.2s;">Trip Plans</a>
            <a href="team.html" style="color: var(--gray); text-decoration: none; font-size: 0.85em; transition: color 0.2s;">Team</a>
          </div>
        </div>
        <div>
          <div style="font-family: 'Cinzel', serif; color: var(--white); font-size: 0.85em; margin-bottom: 12px; letter-spacing: 1px;">SUPPORT</div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <a href="privacy.html" style="color: var(--gray); text-decoration: none; font-size: 0.85em; transition: color 0.2s;">Privacy Policy</a>
            <a href="contact.html" style="color: var(--gray); text-decoration: none; font-size: 0.85em; transition: color 0.2s;">Contact Us</a>
            <a href="#" onclick="alert('Contact: support@futurestarsla.com'); return false;" style="color: var(--gray); text-decoration: none; font-size: 0.85em; transition: color 0.2s;">Support</a>
            <span style="color: var(--gray); font-size: 0.85em;">Version 2.0</span>
          </div>
        </div>
      </div>
      <div style="border-top: 1px solid var(--border); padding-top: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
        <span style="color: var(--gray-dark); font-size: 0.8em;">© ${year} Future Stars Sports Co. All rights reserved.</span>
        <span style="color: var(--gray-dark); font-size: 0.8em;">Made with 🏆 in Louisiana</span>
      </div>
    </div>
  `;
  
  // Insert before closing body tag
  document.body.appendChild(footer);
  
  // Add hover effect for footer links
  footer.querySelectorAll('a').forEach(a => {
    a.addEventListener('mouseenter', function() { this.style.color = 'var(--gold)'; });
    a.addEventListener('mouseleave', function() { this.style.color = 'var(--gray)'; });
  });
})();
