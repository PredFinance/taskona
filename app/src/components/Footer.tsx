import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  MessageCircle,
  Shield,
  CheckCircle,
  Building,
} from "lucide-react"
import Link from "next/link"
import styles from "./Footer.module.css"

export default function Footer() {
  return (
    <footer id="contact" className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.brand}>
            <div className={styles.logo}>
              <h3 className={styles.logoText}>Taskona</h3>
            </div>
            <p className={styles.brandDescription}>
              Empowering young Nigerians to earn money online through simple tasks and referrals. Join thousands who
              have already started their journey to financial freedom.
            </p>
            <div className={styles.socialLinks}>
              <a href="#" className={styles.socialLink}>
                <Facebook size={20} />
              </a>
              <a href="#" className={styles.socialLink}>
                <Twitter size={20} />
              </a>
              <a href="#" className={styles.socialLink}>
                <Instagram size={20} />
              </a>
              <a href="#" className={styles.socialLink}>
                <MessageCircle size={20} />
              </a>
            </div>
          </div>

          <div className={styles.links}>
            <div className={styles.linkGroup}>
              <div className={styles.linkTitle}>Support</div>
              <ul className={styles.linkList}>
                <li>
                  <Link href="/help" className={styles.link}>
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className={styles.link}>
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
            <div className={styles.linkGroup}>
              <div className={styles.linkTitle}>Legal</div>
              <ul className={styles.linkList}>
                <li>
                  <Link href="/terms" className={styles.link}>
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className={styles.link}>
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className={styles.contact}>
            <h4 className={styles.contactTitle}>Get In Touch</h4>
            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <Mail className={styles.contactIcon} />
                <span>support@taskona.ng</span>
              </div>
              <div className={styles.contactItem}>
                <Phone className={styles.contactIcon} />
                <span>+234 800 TASKONA</span>
              </div>
              <div className={styles.contactItem}>
                <MapPin className={styles.contactIcon} />
                <span>Lagos, Nigeria</span>
              </div>
            </div>

            <div className={styles.supportHours}>
              <div className={styles.supportTitle}>Support Hours</div>
              <div className={styles.supportTime}>Monday - Friday: 9AM - 6PM</div>
              <div className={styles.supportTime}>Saturday: 10AM - 4PM</div>
              <div className={styles.supportNote}>24/7 WhatsApp Support Available</div>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <div className={styles.bottomContent}>
            <div className={styles.copyright}>
              <p>&copy; {new Date().getFullYear()} Taskona. All rights reserved.</p>
              <p className={styles.tagline}>Built for young Nigerians who want to earn online.</p>
            </div>

            <div className={styles.certifications}>
              <div className={styles.cert}>
                <Shield className={styles.certIcon} />
                <span>SSL Secured</span>
              </div>
              <div className={styles.cert}>
                <CheckCircle className={styles.certIcon} />
                <span>Verified Platform</span>
              </div>
              <div className={styles.cert}>
                <Building className={styles.certIcon} />
                <span>Bank Grade Security</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
