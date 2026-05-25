export default function Nav() {
  return (
    <nav className="nav">
      <div className="brand">
        <div className="mark">
          A<span className="green">K</span>KC
        </div>
        <div className="brand-title">
          Agjencia Kombëtare e<br />
          Kontrollit të Cannabis-it
        </div>
      </div>
      <div className="menu">
        <a href="#">Kreu</a>
        <a href="#">Agjencia</a>
        <a href="#">Legjislacioni</a>
        <a href="#" className="active">Licensimi</a>
        <a href="#">Lajme</a>
        <a href="#">Punësim</a>
        <a href="#">Publikime</a>
        <a href="#">Projekte</a>
        <a href="#">Lidhje</a>
        <a href="#">Kontakt</a>
        <span className="flag">🇬🇧</span>
      </div>
      <div className="ministry">
        <div className="building" />
        MINISTRIA E SHËNDETËSISË<br />DHE MIRËQENIES SOCIALE
      </div>
    </nav>
  );
}
