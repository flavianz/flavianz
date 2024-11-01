import styles from "./Projects.module.css";
export default function Projects({
    animation,
}: {
    animation: { [_: string]: string };
}) {
    const className = Object.keys(animation).includes("/projects")
        ? animation["/projects"]
        : "";
    return (
        <div className={className + " " + styles.container}>
            <h1 className={styles.title}>Recent projects</h1>
            <div className={styles.projects}>
                {[
                    {
                        title: "School App",
                        description:
                            "In secondary school, we had a very old and poor quality tool where we could see our grades, timetables etc. To fix this, I created a Node.js API that crawled the students' data and a React Native mobile app to go with it.",
                    },
                    {
                        title: "Compiler",
                        description:
                            "As a school project, I created a compiler in Typescript that compiled 'EmojiDo', a programming language I invented that only uses Emojis, to x86 Assembly. Along the way, I wrote a small public documentation for the language.",
                        href: "https://emojido.flavianz.ch",
                    },
                    {
                        title: "Chess Engine",
                        description:
                            "Right now, I am trying to build a UCI chess engine called 'Cobalt' in Rust that can beat me or any other average to good player in a game of chess.",
                        href: "https://www.github.com/flavianz/cobalt",
                    },
                ].map((project, id) => {
                    return (
                        <a
                            href={project.href}
                            target={"_blank"}
                            key={id}
                            className={
                                styles.projectContainer +
                                (project.href
                                    ? " " + styles.projectClickable
                                    : "")
                            }
                        >
                            <h3 className={styles.projectHeader}>
                                {project.title}
                            </h3>
                            <p className={styles.projectDescription}>
                                {project.description}
                            </p>
                        </a>
                    );
                })}
            </div>
        </div>
    );
}
