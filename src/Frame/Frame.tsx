import styles from "./Frame.module.css";
import Welcome from "../pages/Welcome/Welcome.tsx";
import { useEffect, useRef, useState } from "react";
import Projects from "../pages/Projects/Projects.tsx";
import Hobbies from "../pages/Hobbies/Hobbies.tsx";
import "./Frame.css";
import Age from "../pages/Age/Age.tsx";
import Legal from "../pages/Legal/Legal.tsx";
import About from "../pages/About/About.tsx";
import Stack from "../pages/Stack/Stack.tsx";

const pages: { [_: string]: string } = {
    "/": "Hi",
    "/stack": "Stack",
    "/projects": "Projects",
    "/about": "About",
    "/legal": "Bla Bla Bla",
};
const pagesArray = Object.keys(pages);
function GitHubLogo() {
    return (
        <svg
            viewBox={"0 0 100 100"}
            className={styles.github}
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"
            />
        </svg>
    );
}

function MailIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.6"
            stroke-linecap="round"
            stroke-linejoin="round"
            className={styles.mail}
        >
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
    );
}

export default function Frame() {
    if (!pagesArray.includes(window.location.pathname)) {
        window.location.pathname = "";
    }
    const [path, setPath] = useState(window.location.pathname);
    const [animations, setAnimations] = useState<{ [id: string]: string }>({});

    function Page({ renderPath }: { renderPath: string }) {
        switch (renderPath) {
            case "/":
                return <Welcome animation={animations} />;
            case "/about":
                return <About animation={animations} />;
            case "/projects":
                return <Projects animation={animations} />;
            case "/age":
                return <Age animation={animations} />;
            case "/hobbies":
                return <Hobbies animation={animations} />;
            case "/legal":
                return <Legal animation={animations}></Legal>;
            case "/stack":
                return <Stack animation={animations} />;
            default:
                return <Welcome animation={animations} />;
        }
    }

    const lastScroll = useRef(0);

    function navigateUp(animate = true) {
        const index = pagesArray.indexOf(path);
        if (index !== pagesArray.length - 1) {
            setPath(pagesArray[index + 1]);
            if (animate) {
                setAnimations({
                    [pagesArray[index + 1]]: "downIn",
                });
            } else {
                setAnimations({});
            }
        }
    }

    function navigateDown(animate = true) {
        const index = pagesArray.indexOf(path);
        if (index !== 0) {
            setPath(pagesArray[index - 1]);
            if (animate) {
                setAnimations({
                    ...animations,
                    [pagesArray[index - 1]]: "upIn",
                });
            } else {
                setAnimations({});
            }
        }
    }

    function isCropped() {
        const isCropped = window.innerWidth / window.innerHeight <= 1;
        if (isCropped) {
            setAnimations({});
        }
        return isCropped;
    }

    function handleWheel(event: WheelEvent) {
        if (isCropped()) {
            return;
        }
        if (Date.now() - lastScroll.current < 200) {
            lastScroll.current = Date.now();
            return;
        }
        if (event.deltaY > 0) {
            // up
            navigateUp();
        } else {
            // down
            navigateDown();
        }
        lastScroll.current = Date.now();
    }

    function handleKeyDown(event: KeyboardEvent) {
        switch (event.key) {
            case "ArrowLeft":
            case "ArrowUp": {
                navigateDown(!isCropped());
                break;
            }
            case "ArrowDown":
            case "ArrowRight": {
                navigateUp(!isCropped());
                break;
            }
            default: {
                return;
            }
        }
    }

    useEffect(() => {
        window.addEventListener("wheel", handleWheel);
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("wheel", handleWheel);
            window.removeEventListener("keydown", handleKeyDown);
        };
    });

    return (
        <div className={styles.container}>
            <div className={styles.headerContainer}>
                <h1
                    className={styles.logo}
                    onClick={() => {
                        window.location.pathname = "";
                    }}
                >
                    FZ
                </h1>
                <div>
                    <a
                        className={styles.mailContainer}
                        href="mailto:flavianzullig@gmail.com"
                    >
                        <MailIcon />
                    </a>
                    <a
                        className={styles.githubContainer}
                        href="https://www.github.com/flavianz"
                        target="_blank"
                    >
                        Github Logo{/*for seo (not visible)*/}
                        <GitHubLogo />
                    </a>
                </div>
            </div>
            <div id={styles.pageContainer}>
                <Page renderPath={path} />
            </div>

            <div id={styles.menuContainer}>
                {pagesArray.map((page, i) => {
                    return (
                        <div
                            className={
                                styles.menuButtonWrapper +
                                (i === pagesArray.indexOf(path)
                                    ? " " + styles.menuSelected
                                    : "")
                            }
                            key={i}
                            onClick={() => {
                                setAnimations({});
                                setPath(page);
                            }}
                        >
                            <p>{pages[page]}</p>
                            <div className={styles.menuButton} />
                        </div>
                    );
                })}
            </div>
            <div id={styles.navArrowsContainer}>
                {pagesArray.indexOf(path) !== 0 && (
                    <p onClick={() => navigateDown(false)}>{"<"}</p>
                )}
                <p style={{ flex: 1 }}></p>
                {pagesArray.indexOf(path) !== pagesArray.length - 1 && (
                    <p onClick={() => navigateUp(false)}>{">"}</p>
                )}
            </div>
        </div>
    );
}
