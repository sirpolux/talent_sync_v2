import { ArrowRight, PlayCircle } from "lucide-react";

export default function HeroSection() {
    return (
        <section className="min-h-screen flex items-center bg-gradient-to-b from-gray-50 to-white">

            <div className="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-12 items-center">

                {/* LEFT CONTENT */}
                <div>

                    <span className="inline-block bg-brand-secondary text-brand-primary px-4 py-1 rounded-full text-sm font-medium">
                        Training-Driven HR Platform
                    </span>

                    <h1 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                        Build a Workforce That
                        <span className="text-brand-primary"> Grows With Your Organization</span>
                    </h1>

                    <p className="mt-6 text-lg text-gray-600 max-w-xl">
                        TalentSync HR helps organizations identify skill gaps, automate
                        employee training, and prepare teams for promotion through a
                        structured and intelligent learning system.
                    </p>

                    {/* CTA */}
                    <div className="mt-10 flex flex-wrap gap-4">

                        <button className="flex items-center gap-2 bg-brand-primary text-brand-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-95 transition">
                            Start Free Trial
                            <ArrowRight size={18}/>
                        </button>

                        <button className="flex items-center gap-2 border border-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100">
                            <PlayCircle size={18}/>
                            Watch Demo
                        </button>

                    </div>

                    <p className="mt-6 text-sm text-gray-500">
                        No credit card required • Easy setup • Built for modern teams
                    </p>

                </div>

                {/* RIGHT CONTENT (PRODUCT PREVIEW) */}
                <div className="relative">

                    <div className="p-4">

                        <img
                            src="/img/Talent_Sync_hero_Img.svg"
                            alt="TalentSync Dashboard"
                            className="rounded-lg"
                        />

                    </div>

                    {/* decorative gradient */}
                    <div className="absolute -z-10 top-10 right-10 w-72 h-72 bg-brand-secondary rounded-full blur-3xl opacity-40"></div>

                </div>

            </div>

        </section>
    );
}
