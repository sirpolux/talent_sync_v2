import {
    Zap,
    TrendingUp,
    Users,
    BarChart3,
    ShieldCheck,
    Target
} from "lucide-react";

export default function Benefits() {

    const benefits = [
        {
            icon: Zap,
            title: "Automate Training Management",
            description:
                "Eliminate manual scheduling, reminders, and training coordination with automated workflows."
        },
        {
            icon: TrendingUp,
            title: "Improve Workforce Competency",
            description:
                "Ensure employees continuously develop the skills required to perform their roles effectively."
        },
        {
            icon: BarChart3,
            title: "Data-Driven Promotion Decisions",
            description:
                "Use measurable competency data and training records to make informed promotion decisions."
        },
        {
            icon: Users,
            title: "Increase Employee Engagement",
            description:
                "Provide clear learning paths that motivate employees to grow within the organization."
        },
        {
            icon: ShieldCheck,
            title: "Maintain Compliance & Standards",
            description:
                "Track mandatory training programs and maintain compliance across departments."
        },
        {
            icon: Target,
            title: "Align Training With Business Goals",
            description:
                "Ensure employee development aligns with organizational growth and operational excellence."
        }
    ];

    return (
        <section className="py-28 bg-gray-50">

            <div className="max-w-7xl mx-auto px-6">

                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto">

                    <h2 className="text-3xl md:text-4xl font-bold">
                        Why Organizations Choose TalentSync HR
                    </h2>

                    <p className="mt-6 text-gray-600 text-lg">
                        TalentSync HR helps organizations transform employee training
                        into a structured system that improves performance,
                        promotes growth, and supports long-term success.
                    </p>

                </div>

                {/* Benefits Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 mt-20">

                    {benefits.map((benefit, index) => {

                        const Icon = benefit.icon;

                        return (
                            <div
                                key={index}
                                className="bg-white p-8 rounded-xl border hover:shadow-xl transition group"
                            >

                                <div className="w-12 h-12 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition">

                                    <Icon size={22} />

                                </div>

                                <h3 className="mt-6 text-xl font-semibold">
                                    {benefit.title}
                                </h3>

                                <p className="mt-3 text-gray-600 text-sm leading-relaxed">
                                    {benefit.description}
                                </p>

                            </div>
                        );
                    })}

                </div>

            </div>

        </section>
    );
}