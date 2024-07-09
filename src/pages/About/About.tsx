import styles from "./About.module.css";

export default function About({
    animation,
}: {
    animation: { [_: string]: string };
}) {
    const className = Object.keys(animation).includes("/about")
        ? animation["/about"]
        : "";
    return (
        <div className={className} id={styles.container}>
            <h1 className={styles.title}>About me</h1>
            <p id={styles.text}>
                Hi, I'm Flavian. Currently, I'm in my second year of Swiss{" "}
                <a href="https://www.gymoberwil.ch/home">
                    high school (Gymnasium)
                </a>
                . Starting fall 2024, I will be joining a few computer science
                classes at the{" "}
                <a href="https://www.unibas.ch/en.html">University of Basel</a>{" "}
                as part of a foster program. <br /> <br />
                In my free time, I love tinkering with and learning about new
                technologies. Moreover, I like to recreate things we all take
                for granted, such as{" "}
                <a href="https://github.com/flavianz/emojido">compilers</a> or
                chess engines, to learn more about how they work internally.{" "}
                <br /> <br />
                When I'm not at the computer, I'm usually playing or coaching
                floorball, enjoying a bit of volleyball or just hanging out with
                my friends.
            </p>
        </div>
    );
}
