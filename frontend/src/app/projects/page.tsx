import Link from "next/link";

export default function ProjectsPage() {
  type ProjectData = {
    href: string;
    icon: string;
    alt: string;
    label: string;
  };

  const projectLinks: ProjectData[] = [
    {
      href: "/projects/solarsystem",
      icon: "/saturn-icon-white.svg",
      alt: "Saturn Icon",
      label: "Solar System",
    },
    {
      href: "/projects/orbit-simulation",
      icon: "/orbit-icon-white.svg",
      alt: "Orbit Icon",
      label: "Orbit Simulation",
    },
  ];

  return (
    <div className="page-shell">
      <main className="page-main">
        <section className="fade-trigger">
          <div className="container mx-auto px-4 pt-8">
            <h1>Projects</h1>
            {/* Opening statement */}
            <p className="mt-6 text-lg text-slate-100">
              Explore some of the projects I've worked on, showcasing my skills
              and interests.
            </p>
            <p>
              It needs to be said that these are not ALL of my projects that I
              have worked on, but rather a selection of projects that I have
              chosen to adapt/create on this websites architecture.
            </p>
            <p>
              If you would like to see more of my work, please visit my GitHub
              Page
            </p>
            <Link
              href="https://github.com/nathanpons"
              target="_blank"
              rel="noopener noreferrer"
              className="primary-button"
            >
              GitHub Page
            </Link>
          </div>
        </section>

        <section className="fade-trigger">
          {/* Project List */}
          <div className="pt-12 border-t border-slate-700/60">
            <h2 className="text-2xl font-semibold my-12">Project List</h2>
            {projectLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-full p-6 my-10 bg-gray-800 border border-amber-500 shadow-md hover:bg-amber-900/40 transition-shadow duration-300"
              >
                <div className="flex items-center gap-4">
                  <img src={link.icon} alt={link.alt} className="w-18 h-18" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {link.label}
                  </h2>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
