Heart Disease Prediction (HeartAI)

ML-based web app to predict heart disease risk using PCA + Logistic Regression.

📌 Required Frontend Features (Mandatory)

        All inputs must be present:
        BeatStat_HR_N (PC1)
        BeatStat_CI_vc (PC2)
        BeatStat_CI_mean (PC3)
        BeatStat_mBP_var (PC4)
        dBPS_LF_HF_dBP_min (PC5)
        HRS_RRI_LF_min (PC6)
        BeatStat_mBP_mean (PC8)
        HRS_RRI_HFnu_max (PC9)
        BeatStat_HR_mean (PC10)
        HRS_RRI_LF_HF_max (PC13)

⚙️ Pipeline

        StandardScaler → PCA → Logistic Regression

🔗 API

        POST /predict
        Returns:
        prediction (0/1)
        risk_level
        probability
        confidence

🛠 Tech Stack

        Flask, Scikit-learn, Pandas, NumPy, JS

⚠️ Note

        For educational use only (not medical advice).

