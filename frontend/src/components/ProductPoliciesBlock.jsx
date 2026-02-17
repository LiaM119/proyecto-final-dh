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
              "El producto debe utilizarse únicamente para el fin para el cual fue diseñado. Un uso indebido puede causar daños o fallas.",
          },
          {
            title: "Cuidados generales",
            description:
              "Mantener el producto limpio y seco. Evitar exposición prolongada al sol, humedad o temperaturas extremas.",
          },
          {
            title: "Seguridad",
            description:
              "No permitir el uso del producto por personas no capacitadas. Si detectás fallas, suspendé su uso inmediatamente.",
          },
        ];

  return (
    <section className="ppb-container">
      <h2 className="ppb-title">Políticas del producto</h2>

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
