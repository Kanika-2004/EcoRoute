import React from "react";

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer style={{ textAlign: 'center', padding: '20px' }}>
      <p>Copyright ⓒ {year}</p>
    </footer>
  );
}

export default Footer;
