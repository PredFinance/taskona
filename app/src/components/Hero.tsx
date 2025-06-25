import Link from "next/link"
import { ArrowRight, Play, Star, Shield, Zap, Smartphone, DollarSign, Target, Users, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import styles from "./Hero.module.css"

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.badge}>
            <Star className={styles.badgeIcon} />
            <span>Trusted by 50,000+ Nigerians</span>
          </div>

          <h1 className={styles.title}>
            Earn <span className={styles.highlight}>₦25,000</span> Monthly by Completing Simple Tasks
          </h1>

          <p className={styles.subtitle}>
            Activate your account with just ₦300 and start earning rewards by doing simple tasks and referring others.
            Built for young Nigerians who want to earn online.
          </p>

          <div className={styles.stats}>
            <div className={styles.stat}>
              <div className={styles.statNumber}>₦1,500</div>
              <div className={styles.statLabel}>Welcome Bonus</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statNumber}>₦300</div>
              <div className={styles.statLabel}>Activation Fee</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statNumber}>₦25,000</div>
              <div className={styles.statLabel}>Monthly Potential</div>
            </div>
          </div>

          <div className={styles.actions}>
            <Link href="/auth/signup" passHref>
              <Button className={styles.primaryBtn} asChild>
                <>
                  Create Account
                  <ArrowRight className={styles.btnIcon} />
                </>
              </Button>
            </Link>
            <Button variant="outline" className={styles.secondaryBtn}>
              <Play className={styles.btnIcon} />
              See How It Works
            </Button>
          </div>

          <div className={styles.trustIndicators}>
            <div className={styles.trustItem}>
              <Shield className={styles.trustIcon} />
              <span>Secure Platform</span>
            </div>
            <div className={styles.trustItem}>
              <Zap className={styles.trustIcon} />
              <span>Instant Payouts</span>
            </div>
            <div className={styles.trustItem}>
              <Smartphone className={styles.trustIcon} />
              <span>Mobile Friendly</span>
            </div>
          </div>
        </div>

        <div className={styles.visual}>
          <div className={styles.phoneFrame}>
            <img
              src="/phone.png"
              alt="Taskona mobile app preview"
              className={styles.phoneImage}
              width={320}
              height={640}
              style={{ maxWidth: "100%", height: "auto", display: "block", margin: "0 auto" }}
            />
          </div>
          <div className={styles.floatingElements}>
            <div className={styles.floatingCard} style={{ animationDelay: "0s" }}>
              <DollarSign className={styles.cardIcon} />
              <div className={styles.cardText}>+₦200 earned</div>
            </div>
            <div className={styles.floatingCard} style={{ animationDelay: "1s" }}>
              <Target className={styles.cardIcon} />
              <div className={styles.cardText}>Task completed</div>
            </div>
            <div className={styles.floatingCard} style={{ animationDelay: "2s" }}>
              <Users className={styles.cardIcon} />
              <div className={styles.cardText}>+1 referral</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
