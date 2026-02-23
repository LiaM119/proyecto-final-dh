import { Mail, Phone, MapPin, Instagram, Facebook, Linkedin } from "lucide-react";
import "../styles/Contacto.css";

const contactData = {
  email: "reservas@turmalinhotel.com",
  phone: "+54 11 5XXX-78XX",
  address: "Av. Siempre Viva 742, CABA, Argentina",
  instagram: "@turmalin.hotel",
  facebook: "Turmalin Hotel",
  linkedin: "Turmalin Hospitality",
};

export default function Contacto() {
  return (
    <main className="contact-page">
      <section className="contact-card" aria-labelledby="contacto-title">
        <p className="contact-kicker">Canales de atencion</p>
        <h1 id="contacto-title">Contacto</h1>
        <p className="contact-lead">
          Este bloque contiene datos de ejemplo para demostracion del sitio.
        </p>

        <ul className="contact-list">
          <li>
            <Mail size={18} aria-hidden="true" />
            <span>{contactData.email}</span>
          </li>
          <li>
            <Phone size={18} aria-hidden="true" />
            <span>{contactData.phone}</span>
          </li>
          <li>
            <MapPin size={18} aria-hidden="true" />
            <span>{contactData.address}</span>
          </li>
          <li>
            <Instagram size={18} aria-hidden="true" />
            <span>{contactData.instagram}</span>
          </li>
          <li>
            <Facebook size={18} aria-hidden="true" />
            <span>{contactData.facebook}</span>
          </li>
          <li>
            <Linkedin size={18} aria-hidden="true" />
            <span>{contactData.linkedin}</span>
          </li>
        </ul>
      </section>
    </main>
  );
}

