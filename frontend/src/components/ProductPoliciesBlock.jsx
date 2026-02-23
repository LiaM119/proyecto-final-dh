// src/components/ProductPoliciesBlock.jsx
import "./../styles/productPoliciesBlock.css";

export default function ProductPoliciesBlock({ policies = [] }) {

  const safePolicies =
    policies?.length > 0
      ? policies
      : [
          {
            title: "Uso adecuado",
            description:
              "El alojamiento debe utilizarse respetando la capacidad y condiciones de la reserva.",
          },
          {
            title: "Cuidados generales",
            description:
              "Mantener la habitacion en buen estado y respetar horarios establecidos.",
          },
          {
            title: "Seguridad",
            description:
              "No superar la capacidad maxima ni realizar actividades no autorizadas en el alojamiento.",
          },
        ];

  return (
    <section className="ppb-container">
      <h2 className="ppb-title">Politicas del alojamiento</h2>

      <div className="ppb-grid">
        {safePolicies.map((p, idx) => (
          <article className="ppb-card" key={`${p.title}-${idx}`}>
            <h3 className="ppb-card-title">{p.title}</h3>
            <p className="ppb-card-desc">{p.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

