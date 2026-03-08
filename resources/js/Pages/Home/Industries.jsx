import {
    Factory,
    Truck,
    HeartPulse,
    Beer,
    Building2,
    Rocket
} from "lucide-react";

export default function Industries() {

    const industries = [
        {
            icon: Factory,
            title: "Manufacturing",
            description:
                "Ensure workers are properly trained for operational tasks, safety procedures, and equipment handling."
        },
        {
            icon: Truck,
            title: "Logistics & Supply Chain",
            description:
                "Track workforce competency in logistics operations, safety standards, and compliance requirements."
        },
        {
            icon: HeartPulse,
            title: "Healthcare",
            description:
                "Manage mandatory training, certifications, and compliance for healthcare professionals."
        },
        {
            icon: Beer,
            title: "Breweries & Production",
            description:
                "Support continuous training for production staff and maintain high operational standards."
        },
        {
            icon: Building2,
            title: "Corporate Organizations",
            description:
                "Build structured learning programs that prepare employees for leadership and promotion."
        },
        {
            icon: Rocket,
            title: "Growing Startups",
            description:
                "Create scalable employee development systems that grow with your team."
        }
    ];

    return (
        <section className="py-28 bg-white">

            <div className="max-w-7xl mx-auto px-6">

                {/* Header */}
                <div className="text-center max-w-3xl mx-auto">

                    <h2 className="text-3xl md:text-4xl font-bold">
                        Built for Organizations That Value Growth
                    </h2>

                    <p className="mt-6 text-gray-600 text-lg">
                        TalentSync HR is designed for industries where
                        **continuous training, skill development, and operational
                        readiness are critical to success.**
                    </p>

                </div>

                {/* Industry Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-20">

                    {industries.map((industry, index) => {

                        const Icon = industry.icon;

                        return (
                            <div
                                key={index}
                                className="group border rounded-xl p-7 hover:shadow-xl transition bg-gray-50"
                            >

                                <div className="w-12 h-12 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition">

                                    <Icon size={22} />

                                </div>

                                <h3 className="mt-5 text-xl font-semibold">
                                    {industry.title}
                                </h3>

                                <p className="mt-3 text-gray-600 text-sm leading-relaxed">
                                    {industry.description}
                                </p>

                            </div>
                        );
                    })}

                </div>

            </div>

        </section>
    );
}