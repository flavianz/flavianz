import styles from "./Header.module.css"

export default function Header(){
    return <div className={styles.container}>
        <a className={styles.link}>Projects</a>
        <a className={styles.link}>Blog</a>
        <a className={styles.link}>Contact</a>
    </div>
}