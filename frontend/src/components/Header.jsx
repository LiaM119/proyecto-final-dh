import { Link } from "react-router-dom";

export default function Header() {
    return (
        <header className="encabezado">

            <div className="div-encabezado">
                <a href="/" className="marca">
                    <span className="marca_logo">Turmalin</span>
                    <span className="marca_tag">Servicio Técnico de PC</span>
                </a>

                <nav className="encabezado-acciones">
                    <Link to="/productos">Productos</Link>
                    <a href="#contacto">Contacto</a>
                    <button className="btn-encabezado">Crear cuenta</button>
                    <button className="btn-encabezado">Iniciar sesión</button>
                </nav>
            </div>

        </header>
    ); 
}