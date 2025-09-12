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
                <Item
                    title={"School App"}
                    description={
                        "In secondary school, we had a very old and poor quality tool where we could see our grades, timetables etc. To fix this, I created a Node.js API that crawled the students' data and a React Native mobile app to go with it."
                    }
                    href={""}
                    stack={[
                        "React Native",
                        "Typescript",
                        "Firebase",
                        "Node.js",
                        "Expo",
                    ]}
                />
                <Item
                    title={"Compiler"}
                    description={
                        "As a school project, I created a compiler in Typescript that compiled 'EmojiDo', a programming language I invented that only uses Emojis, to x86 Assembly. Along the way, I wrote a small public documentation for the language."
                    }
                    href={"https://emojido.flavianz.ch"}
                    stack={["TypeScript", "ASM x86", "React", "MDX", "Vite"]}
                />
                <Item
                    title={"Playground"}
                    description={
                        "Sometimes, I get the urge just to create my own version of a small simple game like Tic-Tac-Toe or some useful tool. For this, I created this little collection of all my small little side projects to be stored all in one place"
                    }
                    href={"https://playground.flavianz.ch"}
                    stack={["TypeScript", "React", "Vite", "Github Pages"]}
                />
                <Item
                    title={"Club Management Software"}
                    description={
                        "I am currently developing a club management solution for my local floorball club. The goal is a complete all-in-one tool for managing members, teams, events finances and everything in between. The platform is available to every member of the club via native mobile app or the web."
                    }
                    href={"https://www.github.com/flavianz/tv-oberwil"}
                    stack={["Flutter", "Dart", "Firebase", "TypeScript"]}
                />
                <Item
                    title={"'Among Us'-inspired Game"}
                    description={
                        "As a project for a course at the University of Basel, me, along with three other team members, created a modified version of the popular game 'Among us' in Java. "
                    }
                    href={"https://cc.flavianz.ch"}
                    stack={[
                        "Java",
                        "JavaFX",
                        "Gradle",
                        "Server - Client Architecture",
                    ]}
                />
                <p id={styles.mobileScrollExtender}>a</p>
            </div>
        </div>
    );
}

function Item({
    description,
    title,
    href,
    stack,
}: {
    description: string;
    title: string;
    href: string | undefined;
    stack: string[];
}) {
    return (
        <a
            href={href}
            target={"_blank"}
            className={
                styles.projectContainer +
                (href ? " " + styles.projectClickable : "")
            }
        >
            <div>
                <h3 className={styles.projectHeader}>{title}</h3>
                <p className={styles.projectDescription}>{description}</p>
            </div>
            <div id={styles.stackBubbleContainer}>
                {stack.map((text, key) => (
                    <Bubble key={key} text={text} />
                ))}
            </div>
        </a>
    );
}

function Bubble({ text, key }: { text: string; key: number }) {
    return (
        <p key={key} className={styles.stackBubble}>
            {text}
        </p>
    );
}
