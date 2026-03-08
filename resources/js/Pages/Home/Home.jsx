import Base from "./Base";
import Benefits from "./Benefits";
import CTASection from "./CTASection";
import FeaturesSection from "./FeaturesSection";
import HeroSection from "./HeroSection";
import HowItWorks from "./HowItWorks";
import Industries from "./Industries";
import ProblemSection from "./ProblemSection";
import SolutionSection from "./SolutionSection";

export default function Home() {
    return (
        <div>
          <Base>
            <HeroSection/>
            <ProblemSection/>
            <SolutionSection/>
            <FeaturesSection/>
            <HowItWorks/>
            <Industries/>
            <Benefits/>
            <CTASection/>
          </Base>
        </div>
    );
}