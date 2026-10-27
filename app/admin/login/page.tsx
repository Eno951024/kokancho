import type { Metadata } from "next";
import styles from "../form.module.scss";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "관리자 로그인", robots: { index: false } };

export default function LoginPage() {
  return (
    <div className={styles.loginPage}>
      <div className={styles.loginHead}>
        <p className={styles.eyebrow}>KOKANCHO ADMIN</p>
        <h1 className={styles.loginTitle}>관리자 로그인</h1>
      </div>
      <LoginForm />
    </div>
  );
}
