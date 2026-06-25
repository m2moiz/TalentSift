// ── Demo Seed Data ────────────────────────────────────────────────────────────
//
// Realistic Kafka-scenario seed strings for JD and 3 CVs used in the 2-minute
// TDU demo walkthrough.  The integration pass calls these to prefill the app so
// the presenter can click "Analyze Need" without typing.
//
// Scenario: Senior Java / Kafka developer with Kafka-specialist CV (strong),
// data-architect CV (medium), and PO CV (weak) — per SPEC.md §3.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * JD: Senior Java / Kafka developer — banking context, Paris, ASAP.
 * French, per SPEC.md §8 (JD language → output language).
 */
export const DEMO_JD: string = [
	"Senior Java / Kafka Developer — H/F",
	"",
	"Notre client, une grande banque française, recherche un développeur",
	"Senior Java / Kafka pour renforcer son équipe Core Banking.",
	"",
	"Missions :",
	"• Concevoir et développer des pipelines de données temps réel",
	"  avec Apache Kafka (Kafka Streams, KSQL)",
	"• Participer à l'évolution du socle technique microservices",
	"  (Spring Boot, architecture événementielle)",
	"• Assurer la montée en charge et la résilience des flux",
	"  de transaction (fort volume, faible latence)",
	"• Collaborer avec les équipes Data et Infrastructure",
	"",
	"Compétences requises :",
	"• Java 17+, Spring Boot, JPA/Hibernate",
	"• Apache Kafka (production, Kafka Streams, Schema Registry)",
	"• Connaissances en architecture microservices et event-driven",
	"• SQL, base de données relationnelles (PostgreSQL)",
	"",
	"Compétences appréciées :",
	"• Confluent Kafka Platform",
	"• Kubernetes, Docker",
	"• CI/CD (GitLab CI)",
	"• Connaissance du domaine bancaire",
	"",
	"Contraintes :",
	"• TJM : 550–650 €",
	"• Localisation : Paris 9e (présentiel 2-3j/semaine)",
	"• Date de démarrage : Septembre 2026",
	"• Durée : 12 mois minimum",
	"",
	"Context : Mission dans le cadre d'un projet de modernisation",
	"du système de paiement interbancaire.",
].join("\n");

// ── Candidate CVs ─────────────────────────────────────────────────────────────

/**
 * CV1 — Kafka specialist (strong match for the Kafka JD).
 * Senior Kafka engineer with 7 years of Java, 4 years of Kafka streams,
 * banking experience.
 */
export const DEMO_CV_KAFKA_SPECIALIST: string = [
	"Aïssa B.",
	"Architecte Kafka / Développeur Senior Java",
	"",
	"---",
	"EXPERIENCE PROFESSIONNELLE",
	"",
	"2022–2026 — Lead Kafka Engineer, BNP Paribas, Paris",
	"• Conception et déploiement d'une plateforme Kafka (6 clusters,",
	"  150+ topics) pour le flux de paiement SEPA en temps réel",
	"• Développement de pipelines Kafka Streams en Java 17,",
	"  traitement de 2M+ transactions/jour",
	"• Mise en place de Schema Registry Avro et gouvernance des schémas",
	"• Gestion des connecteurs Kafka Connect (JDBC, Elasticsearch)",
	"",
	"2019–2022 — Développeur Backend Java, Société Générale",
	"• Développement de microservices Spring Boot pour le",
	"  traitement des ordres de bourse",
	"• Migration de l'architecture SOA vers event-driven avec Kafka",
	"• Optimisation des performances (latence < 50ms, throughput x3)",
	"",
	"2017–2019 — Développeur Java, Capgemini",
	"• Développement d'APIs RESTful Spring Boot pour client bancaire",
	"• Intégration continue GitLab CI, déploiement Docker/Kubernetes",
	"",
	"---",
	"COMPÉTENCES",
	"Java 17, Spring Boot, Kafka Streams, Kafka Connect, Avro, KSQL,",
	"PostgreSQL, Kubernetes, Docker, GitLab CI, Confluent Platform",
	"",
	"---",
	"FORMATION",
	"2017 — Diplôme Ingénieur INSA Lyon, spécialité Informatique",
].join("\n");

/**
 * CV2 — Product Owner / IT Project Manager (weak match for pure Java/Kafka role).
 * Excellent profile in delivery management, not in development.
 */
export const DEMO_CV_PO: string = [
	"Clément D.",
	"Product Owner / Chef de Projet IT",
	"",
	"---",
	"EXPERIENCE PROFESSIONNELLE",
	"",
	"2021–2026 — Product Owner, La Poste, Paris",
	"• Pilotage de la roadmap produit applicative (équipe 8 devs)",
	"• Rédaction des spécifications fonctionnelles et techniques",
	"• Priorisation du backlog, animation des daily et sprint reviews",
	"• Coordination avec les métiers et la DSI",
	"",
	"2018–2021 — Chef de Projet IT, Orange",
	"• Gestion de projet mise en conformité RGPD",
	"• Suivi budgétaire et planning, reporting comité de direction",
	"",
	"2016–2018 — Assistant Chef de Projet, Accenture",
	"• Support à la gestion de projet SI pour client télécom",
	"• Rédaction de cahier des charges, suivi fournisseurs",
	"",
	"---",
	"COMPÉTENCES",
	"Product Ownership, Gestion de projet agile (SAFe, Scrum),",
	"Rédaction spécifications, JIRA, Confluence, SQL (requêtes basiques),",
	"Notions Java (formations internes)",
	"",
	"---",
	"FORMATION",
	"2016 — Master Management des Systèmes d'Information, HEC Paris",
].join("\n");

/**
 * CV3 — Data engineer / architect (medium match).
 * Has data pipeline skills and some Java but not Kafka-streams deep.
 */
export const DEMO_CV_DATA_ARCHITECT: string = [
	"Salima E.",
	"Data Engineer / Architecte Data",
	"",
	"---",
	"EXPERIENCE PROFESSIONNELLE",
	"",
	"2020–2026 — Data Engineer, AXA France, Paris",
	"• Conception et maintenance du data lake Hadoop/Spark (batch)",
	"• Développement de pipelines ETL en Python et Scala",
	"• Mise en place de flux Kafka (poc) pour ingestion temps réel",
	"  de données sinistres",
	"• Administration de bases PostgreSQL et Cassandra",
	"",
	"2017–2020 — Ingénieur Big Data, Thales",
	"• Développement de pipelines Spark Streaming en Scala",
	"• Contribution à l'architecture data sur projet Cloud (AWS)",
	"• Automatisation des déploiements avec Ansible et Terraform",
	"",
	"---",
	"COMPÉTENCES",
	"Python, Scala, Spark, Hadoop, Kafka (notions opérationnelles),",
	"PostgreSQL, Cassandra, AWS, Terraform, Ansible, Git",
	"",
	"---",
	"FORMATION",
	"2017 — Diplôme Ingénieur CentraleSupélec, Data Science",
].join("\n");

/**
 * Convenience array of all 3 CV strings in demo order.
 */
export const DEMO_CVS: readonly string[] = [
	DEMO_CV_KAFKA_SPECIALIST,
	DEMO_CV_PO,
	DEMO_CV_DATA_ARCHITECT,
] as const;

/**
 * Candidate display labels matching the order in DEMO_CVS.
 */
export const DEMO_CANDIDATE_NAMES: readonly string[] = [
	"Aïssa B.",
	"Clément D.",
	"Salima E.",
] as const;
