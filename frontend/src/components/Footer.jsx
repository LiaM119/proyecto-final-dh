import "../styles/Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-left">
          <img
            src="/icon.png"           
            alt="Turmalin"
            className="footer-logo"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
          <p className="footer-copy">
            © {new Date().getFullYear()} Turmalin. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
