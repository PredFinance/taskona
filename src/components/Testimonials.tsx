import { Star, Quote, ShieldCheck, DollarSign, Phone } from "lucide-react"
import styles from "./Testimonials.module.css"

export default function Testimonials() {
  const testimonials = [
    {
      name: "Adebayo Johnson",
      location: "Lagos, Nigeria",
      avatar: "AJ",
      rating: 5,
      text: "I earned my first ₦25,000 online thanks to Taskona. The platform is genuine and payments are always on time. I've been able to support my family while studying.",
      earnings: "₦45,000",
      timeframe: "2 months",
    },
    {
      name: "Fatima Abdullahi",
      location: "Abuja, Nigeria",
      avatar: "FA",
      rating: 5,
      text: "As a student, Taskona has been a lifesaver. I can do tasks between classes and earn money for my upkeep. The referral system is amazing!",
      earnings: "₦32,000",
      timeframe: "6 weeks",
    },
    {
      name: "Chinedu Okafor",
      location: "Port Harcourt, Nigeria",
      avatar: "CO",
      rating: 5,
      text: "I was skeptical at first, but Taskona proved me wrong. Simple tasks, real money, and excellent customer support. Highly recommended!",
      earnings: "₦58,000",
      timeframe: "3 months",
    },
    {
      name: "Aisha Mohammed",
      location: "Kano, Nigeria",
      avatar: "AM",
      rating: 5,
      text: "The best decision I made this year was joining Taskona. I've been able to start my small business with the money I earned here.",
      earnings: "₦67,000",
      timeframe: "4 months",
    },
  ]

  return (
    <section id="testimonials" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.badge}>Success Stories</div>
          <h2 className={styles.title}>What Our Users Are Saying</h2>
          <p className={styles.subtitle}>
            Join thousands of satisfied Nigerians who are earning real money with Taskona
          </p>
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <div className={styles.statNumber}>50,000+</div>
            <div className={styles.statLabel}>Active Users</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statNumber}>₦2.5M+</div>
            <div className={styles.statLabel}>Total Paid Out</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statNumber}>4.9/5</div>
            <div className={styles.statLabel}>User Rating</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statNumber}>99.8%</div>
            <div className={styles.statLabel}>Payment Success</div>
          </div>
        </div>

        <div className={styles.testimonialGrid}>
          {testimonials.map((testimonial, index) => (
            <div key={index} className={styles.testimonialCard} style={{ animationDelay: `${index * 0.1}s` }}>
              <div className={styles.cardHeader}>
                <div className={styles.userInfo}>
                  <div className={styles.avatar}>{testimonial.avatar}</div>
                  <div className={styles.userDetails}>
                    <div className={styles.userName}>{testimonial.name}</div>
                    <div className={styles.userLocation}>{testimonial.location}</div>
                  </div>
                </div>
                <div className={styles.rating}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} className={styles.star} />
                  ))}
                </div>
              </div>

              <div className={styles.cardContent}>
                <Quote className={styles.quoteIcon} />
                <p className={styles.testimonialText}>{testimonial.text}</p>
              </div>

              <div className={styles.cardFooter}>
                <div className={styles.earnings}>
                  <div className={styles.earningsAmount}>{testimonial.earnings}</div>
                  <div className={styles.earningsLabel}>earned in {testimonial.timeframe}</div>
                </div>
                <div className={styles.verifiedBadge}>
                  <div className={styles.verifiedIcon}>✓</div>
                  <span>Verified</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.trustSection}>
          <div className={styles.trustContent}>
            <h3 className={styles.trustTitle}>Join the Success Stories</h3>
            <p className={styles.trustText}>
              These are real people earning real money. Your success story could be next!
            </p>
            <div className={styles.trustFeatures}>
              <div className={styles.trustFeature}>
                <div className={styles.trustFeatureIcon}>
                  <ShieldCheck size={20} />
                </div>
                <span>100% Secure Platform</span>
              </div>
              <div className={styles.trustFeature}>
                <div className={styles.trustFeatureIcon}>
                  <DollarSign size={20} />
                </div>
                <span>Guaranteed Payments</span>
              </div>
              <div className={styles.trustFeature}>
                <div className={styles.trustFeatureIcon}>
                  <Phone size={20} />
                </div>
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
