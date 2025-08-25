import { UserPlus, Gift, Target, Wallet, Smartphone, CreditCard, Zap } from "lucide-react"
import styles from "./HowItWorks.module.css"

export default function HowItWorks() {
  const steps = [
    {
      icon: UserPlus,
      title: "Register & Activate",
      description: "Create your account and activate with just ₦300 to unlock all features",
      amount: "₦300",
      color: "#4B3EFF",
    },
    {
      icon: Gift,
      title: "Get Welcome Bonus",
      description: "Receive ₦1,500 bonus instantly after activation to boost your earnings",
      amount: "₦1,500",
      color: "#28A745",
    },
    {
      icon: Target,
      title: "Complete Tasks",
      description: "Do simple daily tasks and refer friends to earn money consistently",
      amount: "₦50-₦300",
      color: "#FFB300",
    },
    {
      icon: Wallet,
      title: "Withdraw Earnings",
      description: "Cash out your earnings when you reach ₦25,000 minimum withdrawal",
      amount: "₦25,000",
      color: "#28A745",
    },
  ]

  return (
    <section id="how-it-works" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.badge}>How It Works</div>
          <h2 className={styles.title}>Start Earning in 4 Simple Steps</h2>
          <p className={styles.subtitle}>
            Join thousands of Nigerians who are already earning money online with our simple and transparent process
          </p>
        </div>

        <div className={styles.steps}>
          {steps.map((step, index) => (
            <div key={index} className={styles.step} style={{ animationDelay: `${index * 0.2}s` }}>
              <div className={styles.stepNumber}>{index + 1}</div>
              <div className={styles.stepIcon} style={{ backgroundColor: `${step.color}20`, color: step.color }}>
                <step.icon size={32} />
              </div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDescription}>{step.description}</p>
                <div className={styles.stepAmount} style={{ color: step.color }}>
                  {step.amount}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={styles.connector}>
                  <div className={styles.connectorLine}></div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={styles.timeline}>
          <div className={styles.timelineItem}>
            <div className={styles.timelineIcon}>
              <Zap size={24} />
            </div>
            <div className={styles.timelineContent}>
              <div className={styles.timelineTitle}>Instant Activation</div>
              <div className={styles.timelineDesc}>Account activated within minutes</div>
            </div>
          </div>
          <div className={styles.timelineItem}>
            <div className={styles.timelineIcon}>
              <Smartphone size={24} />
            </div>
            <div className={styles.timelineContent}>
              <div className={styles.timelineTitle}>Daily Tasks Available</div>
              <div className={styles.timelineDesc}>New earning opportunities every day</div>
            </div>
          </div>
          <div className={styles.timelineItem}>
            <div className={styles.timelineIcon}>
              <CreditCard size={24} />
            </div>
            <div className={styles.timelineContent}>
              <div className={styles.timelineTitle}>Weekly Payouts</div>
              <div className={styles.timelineDesc}>Withdraw earnings every week</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
