"use client"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import styles from "./Header.module.css"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <h2 className={styles.logoText}>Taskona</h2>
        </div>

        <nav className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ""}`}>
          <a href="#how-it-works" className={styles.navLink}>
            How It Works
          </a>
          <a href="#earnings" className={styles.navLink}>
            Earnings
          </a>
          <a href="#testimonials" className={styles.navLink}>
            Reviews
          </a>
          <a href="#contact" className={styles.navLink}>
            Contact
          </a>
        </nav>

        <div className={styles.authButtons}>
          <Button variant="ghost" className={styles.loginBtn}>
            Login
          </Button>
          <Button className={styles.registerBtn}>Register</Button>
        </div>

        <button className={styles.mobileMenuBtn} onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  )
}
