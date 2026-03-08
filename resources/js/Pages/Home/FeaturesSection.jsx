export default function FeaturesSection() {

    const features = [
        {
            title: "Training Management",
            description: "Create and manage training programs across departments."
        },
        {
            title: "Skill Gap Analysis",
            description: "Identify competency gaps between employees and job roles."
        },
        {
            title: "Automated Training Workflows",
            description: "Automatically assign and track training programs."
        },
        {
            title: "Promotion Readiness",
            description: "Know when employees are ready for the next level."
        },
        {
            title: "Interactive Learning",
            description: "Deliver training through videos, quizzes, and simulations."
        },
        {
            title: "Training Analytics",
            description: "Monitor performance using powerful reports."
        }
    ];

    return (
        <section className="py-20">
            <div className="max-w-7xl mx-auto px-6">

                <h2 className="text-3xl font-bold text-center">
                    Everything You Need to Manage Workforce Development
                </h2>

                <div className="grid md:grid-cols-3 gap-8 mt-12">

                    {features.map((feature, index) => (
                        <div key={index} className="p-6 border rounded-lg hover:shadow-lg transition">

                            <h3 className="font-semibold text-xl">
                                {feature.title}
                            </h3>

                            <p className="mt-3 text-gray-600">
                                {feature.description}
                            </p>

                        </div>
                    ))}

                </div>

            </div>
        </section>
    );
}