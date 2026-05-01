import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FeatureIcon: React.FC<{ type: 'book' | 'brain' | 'forum' | 'offline' }> = ({ type }) => {
  if (type === 'book') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 5a3 3 0 0 1 3-3h11a2 2 0 0 1 2 2v15.5a.5.5 0 0 1-.8.4c-.8-.6-1.8-.9-2.8-.9H7a3 3 0 0 0-3 3V5zm3-1a1 1 0 0 0-1 1v12.2A5 5 0 0 1 7 17h9.4c.6 0 1.1.1 1.6.2V4H7z" />
      </svg>
    );
  }

  if (type === 'brain') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 3a4 4 0 0 0-4 4v1a3 3 0 0 0 0 6v1a4 4 0 0 0 4 4h1v-6H8v-2h2V9H8V7h2V3H9zm6 0h-1v6h2v2h-2v2h2v6h-1a4 4 0 0 1-4-4v-1a3 3 0 0 1 0-6V7a4 4 0 0 1 4-4z" />
      </svg>
    );
  }

  if (type === 'forum') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4v-4H5a2 2 0 0 1-2-2V5zm4 3h10v2H7V8zm0 4h7v2H7v-2z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 15h-2v-2h2zm2.1-7.8-.9.9A3 3 0 0 0 13 12h-2v-.5a3.5 3.5 0 0 1 1-2.5l1.2-1.2a1.5 1.5 0 1 0-2.6-1L9.8 8.2 8.4 6.8l.8-.8a3.5 3.5 0 1 1 5.9 2.6z" />
    </svg>
  );
};

export const Home: React.FC = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [activePathology, setActivePathology] = useState(0);
  const { user } = useAuth();

  const features = [
    {
      icon: 'book' as const,
      title: 'Fiches pathologies officielles',
      text: 'Recommandations officielles et fiches a jour.',
    },
    {
      icon: 'brain' as const,
      title: 'Auto-evaluation QCM/QCD',
      text: 'Quiz rapides et suivi de progression.',
    },
    {
      icon: 'forum' as const,
      title: 'Forum d entraide entre pairs',
      text: 'Echanges utiles entre etudiants et praticiens.',
    },
    {
      icon: 'offline' as const,
      title: 'Acces hors ligne bientot',
      text: 'Mode hors ligne disponible tres bientot.',
    },
  ];

  const pathologies = [
    {
      title: 'Paludisme',
      image: 'https://images.unsplash.com/photo-1598885159329-9377168ac375?auto=format&fit=crop&w=1200&q=80',
    },
    {
      title: 'Hypertension arterielle',
      image: 'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?auto=format&fit=crop&w=1200&q=80',
    },
    {
      title: 'Diabete de type 2',
      image: 'https://images.unsplash.com/photo-1584516150909-c43483ee7932?auto=format&fit=crop&w=1200&q=80',
    },
    {
      title: 'Asthme',
      image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80',
    },
  ];

  const testimonials = [
    {
      name: 'Amenan',
      role: 'Etudiante infirmiere',
      text: 'Grace a TIBELE, j ai revise mes examens efficacement. Les fiches sont claires et conformes aux recommandations.',
      rating: '★★★★★',
      avatar: 'https://i.pravatar.cc/120?img=49',
    },
    {
      name: 'Dr Koffi',
      role: 'Medecin generaliste',
      text: 'Le forum et les QCM m aident a former mes internes avec un referentiel harmonise et utile sur le terrain.',
      rating: '★★★★★',
      avatar: 'https://i.pravatar.cc/120?img=12',
    },
    {
      name: 'N Guessan',
      role: 'Sage-femme',
      text: 'Simple, rapide, mobile. Je retrouve en quelques secondes la fiche qui me manque pendant les gardes.',
      rating: '★★★★☆',
      avatar: 'https://i.pravatar.cc/120?img=33',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [testimonials.length]);

  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>('[data-reveal]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActivePathology((prev) => (prev + 1) % pathologies.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [pathologies.length]);

  return (
    <main className="landing">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-overlay" />
        <img
          className="hero-bg"
          src="https://images.unsplash.com/photo-1550831107-1553da8c8464?auto=format&fit=crop&w=1900&q=80"
          alt="Jeune professionnelle de sante souriante en blouse blanche"
          loading="lazy"
        />
        <div className="hero-content container hero-layout">
          <div className="hero-main">
            <p className="badge">Mise a jour cette semaine : 12 nouvelles pathologies</p>
            <h1 id="hero-title">TIBELE - La reference pedagogique des soignants ivoiriens</h1>
            <p>
              Des fiches pathologies completes, des QCM interactifs et un forum d entraide.
            </p>
            <Link to="/pathologies" className="hero-cta-card">
              <span className="hero-cta-title">Explorer toutes les pathologies</span>
              <span className="hero-cta-sub">Acceder aux contenus pedagogiques complets</span>
            </Link>
          </div>
        </div>

        <div className="hero-wave" aria-hidden="true">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,64L80,58.7C160,53,320,43,480,48C640,53,800,75,960,74.7C1120,75,1280,53,1360,42.7L1440,32L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" />
          </svg>
        </div>
      </section>

      <section className="container section-shell reveal" data-reveal id="apprends">
        <div className="section-heading section-heading-centered">
          <h2>Apprends comme jamais</h2>
        </div>
        <div className="learn-grid">
          <article className="learn-card">
            <div className="learn-icon" aria-hidden="true">📘</div>
            <h3>+60</h3>
            <p>Contenus valides chaque mois</p>
          </article>
          <article className="learn-card">
            <div className="learn-icon" aria-hidden="true">✅</div>
            <h3>+94%</h3>
            <p>de taux de satisfaction</p>
          </article>
          <article className="learn-card">
            <div className="learn-icon" aria-hidden="true">⏱️</div>
            <h3>+3h</h3>
            <p>/ semaine de revision</p>
          </article>
          <article className="learn-card">
            <div className="learn-icon" aria-hidden="true">💬</div>
            <h3>24h/7</h3>
            <p>Support client</p>
          </article>
        </div>
      </section>

      <section className="container section-shell reveal" data-reveal id="why">
        <div className="section-heading section-heading-centered">
          <h2>Pourquoi TIBELE ?</h2>
          <p>Une plateforme pensee pour les etudiants et les personnels de sante en Cote d Ivoire.</p>
        </div>

        <div className="feature-grid compact">
          {features.map((item) => (
            <article className="feature-card" key={item.title}>
              <div className="feature-icon" aria-hidden="true">
                <FeatureIcon type={item.icon} />
              </div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container section-shell reveal" data-reveal aria-label="Chiffres cles">
        <div className="section-heading section-heading-centered">
          <h2>TIBELE EN CHIFFRE</h2>
        </div>
        <div className="stats-grid">
          <article><h3>+500</h3><p>pathologies referencees</p></article>
          <article><h3>+2000</h3><p>QCM et QCD disponibles</p></article>
          <article><h3>+10 000</h3><p>etudiants utilisateurs</p></article>
          <article><h3>24/7</h3><p>acces prioritaire abonnes</p></article>
        </div>
      </section>

      <section className="container section-shell reveal" data-reveal id="pathologies">
        <div className="section-heading section-heading-inline">
          <div>
            <h2>Pathologies populaires</h2>
            <p>Un apercu des fiches les plus consultees en acces gratuit.</p>
          </div>
          <Link to="/pathologies" className="btn-secondary">Voir toutes les pathologies</Link>
        </div>

        <div className="pathology-carousel" role="region" aria-label="Carrousel pathologies populaires">
          <div
            className="pathology-track"
            style={{ transform: `translateX(-${activePathology * 100}%)` }}
          >
            {pathologies.map((item) => (
              <article className="pathology-card pathology-slide" key={item.title}>
                <img src={item.image} alt={item.title} loading="lazy" />
                <div className="pathology-card-body">
                  <span className="free-badge">GRATUIT</span>
                  <h3>{item.title}</h3>
                </div>
              </article>
            ))}
          </div>

          <div className="carousel-dots">
            {pathologies.map((item, index) => (
              <button
                key={item.title}
                type="button"
                aria-label={`Voir la pathologie ${index + 1}`}
                aria-current={index === activePathology}
                className={`dot ${index === activePathology ? 'active' : ''}`}
                onClick={() => setActivePathology(index)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="container section-shell reveal" data-reveal id="testimonials">
        <div className="section-heading section-heading-centered">
          <h2>Temoignages</h2>
          <p>Ils utilisent TIBELE pour progresser chaque semaine.</p>
        </div>

        <div className="testimonial-carousel" role="region" aria-label="Carrousel de temoignages">
          <div className="carousel-controls">
            <button
              type="button"
              className="arrow-btn"
              aria-label="Temoignage precedent"
              onClick={() => setActiveTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))}
            >
              ‹
            </button>
            <button
              type="button"
              className="arrow-btn"
              aria-label="Temoignage suivant"
              onClick={() => setActiveTestimonial((prev) => (prev + 1) % testimonials.length)}
            >
              ›
            </button>
          </div>
          <div
            className="testimonial-track"
            style={{ transform: `translateX(-${activeTestimonial * 100}%)` }}
          >
            {testimonials.map((item) => (
              <article className="testimonial-card testimonial-slide" key={item.name}>
                <div className="testimonial-head">
                  <img src={item.avatar} alt={`Profil ${item.name}`} loading="lazy" />
                  <div>
                    <h3>{item.name}</h3>
                    <p>{item.role}</p>
                  </div>
                </div>
                <p>{item.text}</p>
                <div className="stars" aria-label="Note utilisateur">{item.rating}</div>
              </article>
            ))}
          </div>

          <div className="carousel-dots">
            {testimonials.map((item, index) => (
              <button
                key={item.name}
                type="button"
                aria-label={`Voir le temoignage ${index + 1}`}
                aria-current={index === activeTestimonial}
                className={`dot ${index === activeTestimonial ? 'active' : ''}`}
                onClick={() => setActiveTestimonial(index)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="container section-shell reveal" data-reveal id="soutenir">
          <div className="section-heading">
            <h2>Soutenir TIBELE</h2>
            <p>
              TIBELE reste gratuit pour tous les étudiants en santé grâce aux dons de la communauté.
              Si vous le pouvez, soutenez ce projet pédagogique.
            </p>
          </div>
          <div className="subscribe-cta-wrap">
            <Link to="/soutenir" className="btn-primary donate-btn-red">Je fais un don</Link>
          </div>
        </section>

      <section className="container section-shell reveal" data-reveal id="faq">
        <div className="section-heading section-heading-centered">
          <h2>Foire aux questions</h2>
        </div>

        <div className="faq-list">
          <details>
            <summary>Comment creer un compte ?</summary>
            <p>Cliquez sur Connexion / Inscription puis remplissez le formulaire en moins d une minute.</p>
          </details>
          <details>
            <summary>Puis-je resilier mon abonnement ?</summary>
            <p>Oui. Vous pouvez rester sur la formule gratuite a tout moment depuis votre espace personnel.</p>
          </details>
          <details>
            <summary>Les fiches sont-elles a jour ?</summary>
            <p>Nos contenus sont revises regulierement selon les recommandations pedagogiques et pratiques cliniques.</p>
          </details>
          <details>
            <summary>Le site est-il accessible sur mobile ?</summary>
            <p>Oui. L interface est responsive et optimisee pour smartphone et tablette.</p>
          </details>
        </div>
      </section>

      {!user && (
        <section className="cta section-shell reveal" data-reveal aria-labelledby="cta-title">
          <div className="container cta-inner">
            <h2 id="cta-title">Pret a rejoindre la communaute ?</h2>
            <p>Rejoignez des milliers de soignants qui ameliorent leurs connaissances chaque jour.</p>
            <Link to="/register" className="btn-light">Creer un compte gratuitement</Link>
          </div>
        </section>
      )}
    </main>
  );
};
