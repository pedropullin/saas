import { Hero } from "@/components/afago/Hero";
import { Intro } from "@/components/afago/Intro";
import { Experience } from "@/components/afago/Experience";
import { Menu } from "@/components/afago/Menu";
import { HappyHour } from "@/components/afago/HappyHour";
import { Stats } from "@/components/afago/Stats";
import { Location } from "@/components/afago/Location";
import { Contact } from "@/components/afago/Contact";

export default function Home() {
  return (
    <>
      <Hero />
      <Intro />
      <Experience />
      <Menu />
      <HappyHour />
      <Stats />
      <Location />
      <Contact />
    </>
  );
}
