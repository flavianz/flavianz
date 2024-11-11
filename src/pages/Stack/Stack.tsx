import firebaseIcon from "../../assets/firebase.svg";
import gitIcon from "../../assets/git.svg";
import nodejsIcon from "../../assets/nodejs.svg";
import reactIcon from "../../assets/react.svg";
import rustIcon from "../../assets/rust.svg";
import typescriptIcon from "../../assets/typescript.svg";
import viteIcon from "../../assets/vite.svg";
import styles from "./Stack.module.css";
import jetbrainsIcon from "../../assets/jetbrains.svg";
import pythonIcon from "../../assets/python.svg";
import cPlusPlusIcon from "../../assets/cplusplus.svg";
import postgresIcon from "../../assets/postgres.svg";
import unityIcon from "../../assets/unity.svg";

export default function Stack({
    animation,
}: {
    animation: { [_: string]: string };
}) {
    const className = Object.keys(animation).includes("/stack")
        ? animation["/stack"]
        : "";
    return (
        <div id={styles.container} className={className}>
            <div className={styles.boxContainer}>
                <h1>Daily-drivers</h1>
                <div className={styles.gridContainer}>
                    <Bubble icon={typescriptIcon} text={"Typescript"} />
                    <Bubble icon={nodejsIcon} text={"Node.js"} />
                    <Bubble icon={reactIcon} text={"React"} />
                    <Bubble icon={viteIcon} text={"Vite"} />
                    <Bubble icon={firebaseIcon} text={"Firebase"} />
                    <Bubble icon={gitIcon} text={"Git"} />
                    <Bubble icon={jetbrainsIcon} text={"Jetbrains Software"} />
                </div>
            </div>
            <div className={styles.boxContainer}>
                <h1>Here and there</h1>
                <div className={styles.gridContainer}>
                    <Bubble icon={rustIcon} text={"Rust"} />
                    <Bubble icon={pythonIcon} text={"Python"} />
                    <Bubble icon={cPlusPlusIcon} text={"C++"} />
                    <Bubble icon={postgresIcon} text={"PostgreSQL"} />
                    <Bubble icon={unityIcon} text={"Unity"} />
                </div>
            </div>
        </div>
    );
}

function Bubble({ icon, text }: { icon: string; text: string }) {
    return (
        <div className={styles.box}>
            <img src={icon} alt="" className={styles.logo} />
            <p className={styles.label}>{text}</p>
        </div>
    );
}
