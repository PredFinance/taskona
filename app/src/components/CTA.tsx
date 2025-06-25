import { ArrowRight, Shield, Zap, Users, Gift, Clock, DollarSign, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import styles from "./CTA.module.css"

export default function CTA() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.mainCTA}>
            <div className={styles.ctaContent}>
              <div className={styles.badge}>
                <Zap className={styles.badgeIcon} />
                <span>Limited Time Offer</span>
              </div>

              <h2 className={styles.title}>
                Start Your Journey to <span className={styles.highlight}>₦25,000</span> Monthly
              </h2>

              <p className={styles.subtitle}>
                Join over 50,000 Nigerians who are already earning money online. Activate your account today with just
                ₦300 and get ₦1,500 welcome bonus instantly.
              </p>

              <div className={styles.offerDetails}>
                <div className={styles.offerItem}>
                  <div className={styles.offerIcon}>
                    <Gift size={24} />
                  </div>
                  <div className={styles.offerText}>
                    <div className={styles.offerTitle}>Welcome Bonus</div>
                    <div className={styles.offerAmount}>₦1,500 Free</div>
                  </div>
                </div>
                <div className={styles.offerItem}>
                  <div className={styles.offerIcon}>
                    <Zap size={24} />
                  </div>
                  <div className={styles.offerText}>
                    <div className={styles.offerTitle}>Instant Activation</div>
                    <div className={styles.offerAmount}>Start Earning Today</div>
                  </div>
                </div>
                <div className={styles.offerItem}>
                  <div className={styles.offerIcon}>
                    <DollarSign size={24} />
                  </div>
                  <div className={styles.offerText}>
                    <div className={styles.offerTitle}>Monthly Potential</div>
                    <div className={styles.offerAmount}>Up to ₦25,000</div>
                  </div>
                </div>
              </div>

              <div className={styles.actions}>
                <Link href="/auth/signup" passHref>
                  <Button className={styles.primaryBtn} asChild>
                    <>
                      Activate Account - ₦300
                      <ArrowRight className={styles.btnIcon} />
                    </>
                  </Button>
                </Link>
                <Button variant="outline" className={styles.secondaryBtn}>
                  Learn More First
                </Button>
              </div>

              <div className={styles.guarantee}>
                <Shield className={styles.guaranteeIcon} />
                <span>100% Money-Back Guarantee • Secure Payment • Instant Access</span>
              </div>
            </div>

            <div className={styles.ctaVisual}>
              <div className={styles.moneyStack}>
                <div className={styles.moneyCard} style={{ animationDelay: "0s" }}>
                  <div className={styles.moneyAmount}>₦1,500</div>
                  <div className={styles.moneyLabel}>Welcome Bonus</div>
                </div>
                <div className={styles.moneyCard} style={{ animationDelay: "0.5s" }}>
                  <div className={styles.moneyAmount}>₦25,000</div>
                  <div className={styles.moneyLabel}>Monthly Goal</div>
                </div>
                <div className={styles.moneyCard} style={{ animationDelay: "1s" }}>
                  <div className={styles.moneyAmount}>₦300</div>
                  <div className={styles.moneyLabel}>Activation Fee</div>
                </div>
              </div>

              <div className={styles.floatingStats}>
                <div className={styles.statBubble} style={{ animationDelay: "0s" }}>
                  <Users size={20} />
                  <span>50K+ Users</span>
                </div>
                <div className={styles.statBubble} style={{ animationDelay: "1s" }}>
                  <div className={styles.ratingStars}>⭐⭐⭐⭐⭐</div>
                  <span>4.9/5 Rating</span>
                </div>
                <div className={styles.statBubble} style={{ animationDelay: "2s" }}>
                  <div className={styles.payoutIcon}>
                    <CreditCard size={20} />
                  </div>
                  <span>₦2.5M+ Paid</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.urgency}>
            <div className={styles.urgencyContent}>
              <div className={styles.urgencyIcon}>
                <Clock size={48} />
              </div>
              <div className={styles.urgencyText}>
                <div className={styles.urgencyTitle}>Don't Wait - Start Earning Today!</div>
                <div className={styles.urgencySubtitle}>
                  Every day you wait is money you're not earning. Join now and start your journey to financial freedom.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
