import { TrendingUp, Users, Calendar, Zap, Trophy } from "lucide-react"
import styles from "./EarningBreakdown.module.css"

export default function EarningBreakdown() {
  const earningTypes = [
    {
      icon: Calendar,
      title: "Daily Tasks",
      description: "Complete simple tasks like social media engagement, surveys, and app downloads",
      earning: "₦50 - ₦200",
      frequency: "per task",
      color: "#4B3EFF",
      tasks: ["Social media posts", "App downloads", "Survey completion", "Video watching"],
    },
    {
      icon: Users,
      title: "Referral Bonus",
      description: "Earn when you invite friends and they activate their accounts",
      earning: "₦300",
      frequency: "per referral",
      color: "#28A745",
      tasks: ["Direct referrals", "Second-level bonus", "Team building", "Monthly bonuses"],
    },
    {
      icon: TrendingUp,
      title: "Performance Bonus",
      description: "Extra rewards for consistent activity and high performance",
      earning: "₦500 - ₦1,000",
      frequency: "weekly",
      color: "#FFB300",
      tasks: ["Consistency bonus", "Top performer", "Weekly challenges", "Special events"],
    },
    {
      icon: Zap,
      title: "Instant Tasks",
      description: "Quick micro-tasks that can be completed in minutes",
      earning: "₦25 - ₦100",
      frequency: "per task",
      color: "#FF6B6B",
      tasks: ["Quick surveys", "App testing", "Content rating", "Data entry"],
    },
  ]

  return (
    <section id="earnings" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.badge}>Earning Opportunities</div>
          <h2 className={styles.title}>Multiple Ways to Earn Money</h2>
          <p className={styles.subtitle}>
            Discover various earning opportunities designed to help you reach your ₦25,000 monthly goal
          </p>
        </div>

        <div className={styles.earningGrid}>
          {earningTypes.map((type, index) => (
            <div key={index} className={styles.earningCard} style={{ animationDelay: `${index * 0.15}s` }}>
              <div className={styles.cardHeader}>
                <div className={styles.iconWrapper} style={{ backgroundColor: `${type.color}20` }}>
                  <type.icon size={28} style={{ color: type.color }} />
                </div>
                <div className={styles.earningAmount} style={{ color: type.color }}>
                  {type.earning}
                  <span className={styles.frequency}>{type.frequency}</span>
                </div>
              </div>

              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{type.title}</h3>
                <p className={styles.cardDescription}>{type.description}</p>

                <div className={styles.taskList}>
                  {type.tasks.map((task, taskIndex) => (
                    <div key={taskIndex} className={styles.taskItem}>
                      <div className={styles.taskBullet} style={{ backgroundColor: type.color }}></div>
                      <span className={styles.taskText}>{task}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.cardFooter}>
                <div className={styles.availabilityBadge}>
                  <div className={styles.availabilityDot}></div>
                  Available Now
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.monthlyBreakdown}>
          <div className={styles.breakdownHeader}>
            <h3 className={styles.breakdownTitle}>Monthly Earning Potential</h3>
            <p className={styles.breakdownSubtitle}>Based on consistent daily activity</p>
          </div>

          <div className={styles.breakdownGrid}>
            <div className={styles.breakdownCard}>
              <div className={styles.breakdownIcon}>
                <Calendar size={32} />
              </div>
              <div className={styles.breakdownContent}>
                <div className={styles.breakdownAmount}>₦6,000</div>
                <div className={styles.breakdownLabel}>Daily Tasks (30 days)</div>
                <div className={styles.breakdownDetail}>₦200 × 30 days</div>
              </div>
            </div>

            <div className={styles.breakdownCard}>
              <div className={styles.breakdownIcon}>
                <Users size={32} />
              </div>
              <div className={styles.breakdownContent}>
                <div className={styles.breakdownAmount}>₦9,000</div>
                <div className={styles.breakdownLabel}>Referrals (30 people)</div>
                <div className={styles.breakdownDetail}>₦300 × 30 referrals</div>
              </div>
            </div>

            <div className={styles.breakdownCard}>
              <div className={styles.breakdownIcon}>
                <Trophy size={32} />
              </div>
              <div className={styles.breakdownContent}>
                <div className={styles.breakdownAmount}>₦4,000</div>
                <div className={styles.breakdownLabel}>Performance Bonus</div>
                <div className={styles.breakdownDetail}>₦1,000 × 4 weeks</div>
              </div>
            </div>

            <div className={styles.breakdownCard}>
              <div className={styles.breakdownIcon}>
                <Zap size={32} />
              </div>
              <div className={styles.breakdownContent}>
                <div className={styles.breakdownAmount}>₦6,000</div>
                <div className={styles.breakdownLabel}>Instant Tasks</div>
                <div className={styles.breakdownDetail}>₦200 × 30 days</div>
              </div>
            </div>
          </div>

          <div className={styles.totalEarning}>
            <div className={styles.totalLabel}>Total Monthly Potential</div>
            <div className={styles.totalAmount}>₦25,000+</div>
            <div className={styles.totalNote}>*Based on consistent daily activity and referrals</div>
          </div>
        </div>
      </div>
    </section>
  )
}
