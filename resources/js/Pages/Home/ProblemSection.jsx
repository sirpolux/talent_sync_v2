import { AlertTriangle, BarChart3, Users, Clock } from "lucide-react";

export default function ProblemSection() {

    const problems = [
        {
            icon: Clock,
            title: "Manual Training Management",
            text: "Training programs are often managed with spreadsheets, emails, and scattered documents."
        },
        {
            icon: Users,
            title: "No Clear Skill Visibility",
            text: "Managers struggle to know which employees have the skills required for their roles."
        },
        {
            icon: BarChart3,
            title: "No Data for Promotion Decisions",
            text: "Promotions are often based on assumptions instead of measurable competency data."
        },
        {
            icon: AlertTriangle,
            title: "Operational Risks",
            text: "Untrained or undertrained employees increase operational risks and reduce efficiency."
        }
    ];

    return (
        <section className="py-24 bg-white">

            <div className="max-w-7xl mx-auto px-6">

                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto">

                    <h2 className="text-3xl md:text-4xl font-bold">
                        The Hidden Problem With Traditional HR Systems
                    </h2>

                    <p className="mt-6 text-gray-600 text-lg">
                        Most HR platforms manage employee records but fail to manage
                        **employee growth, training effectiveness, and workforce capability**.
                    </p>

                </div>

                {/* Problem Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">

                    {problems.map((problem, index) => {

                        const Icon = problem.icon;

                        return (
                            <div
                                key={index}
                                className="p-6 border rounded-xl hover:shadow-lg transition bg-gray-50"
                            >

                                <div className="w-12 h-12 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-lg">
                                    <Icon size={22}/>
                                </div>

                                <h3 className="mt-5 font-semibold text-lg">
                                    {problem.title}
                                </h3>

                                <p className="mt-3 text-gray-600 text-sm">
                                    {problem.text}
                                </p>

                            </div>
                        );
                    })}

                </div>

            </div>

        </section>
    );
}