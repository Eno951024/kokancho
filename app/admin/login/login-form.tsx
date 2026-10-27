"use client";

import { useActionState } from "react";
import { signIn, type SignInState } from "../actions";
import styles from "../form.module.scss";

export function LoginForm() {
  const [state, action, pending] = useActionState<SignInState, FormData>(signIn, {});

  return (
    <form action={action} className={styles.loginForm}>
      <label className={styles.field}>
        <span className={styles.label}>메일 주소</span>
        <input
          name="email"
          type="email"
          defaultValue={state.email}
          autoComplete="email"
          required
          className={styles.loginInput}
        />
      </label>
      <label className={styles.field}>
        <span className={styles.label}>비밀번호</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={styles.loginInput}
        />
      </label>
      {state.error && (
        <p role="alert" className={styles.error}>
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className={styles.submit}
      >
        {pending ? "로그인 중…" : "로그인"}
      </button>
    </form>
  );
}
