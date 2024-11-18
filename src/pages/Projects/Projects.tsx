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
                    stack={["Typescript", "ASM x86", "React", "MDX", "Vite"]}
                />
                <Item
                    title={"Song Guessing Game"}
                    description={
                        "Right now, I am building a small multiplayer game where you have to guess the song based on its lyrics. "
                    }
                    href={"https://www.github.com/flavianz/songy"}
                    stack={["React", "Vite", "Firebase", "Node.js"]}
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
