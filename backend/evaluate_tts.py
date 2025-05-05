# evaluate_tts.py

import pandas as pd

data = [
    # Listener 1
    {'Listener': 'Listener 1', 'Original Text': 'මට බඩේ අමාරුවක් තියෙනවා', 'What did you hear?': 'මට බඩේ අමාරුවක් තියෙනවා', 'Rating': 5},
    {'Listener': 'Listener 1', 'Original Text': 'මාසයක් විතර වෙනවා', 'What did you hear?': 'මාසයක විතාර වෙනවා', 'Rating': 2},
    {'Listener': 'Listener 1', 'Original Text': 'මට දියවැඩියාව තියෙනවා', 'What did you hear?': 'මට දියවැඩියාව තියෙනවා', 'Rating': 5},
    {'Listener': 'Listener 1', 'Original Text': 'ඔව් විටමින් පෙති ටිකක් ගන්නවා', 'What did you hear?': 'ඔව් විටමින් ෆයිවු සී ටිකක් ගන්නවා', 'Rating': 3},
    {'Listener': 'Listener 1', 'Original Text': 'ඔව් මට දූවිලි වලට අසාත්මිකතාවයක් තියෙනවා', 'What did you hear?': 'ඔව් මට දූවිලි වලට අසාත්මිකතාවයක් තියෙනවා', 'Rating': 5},
    {'Listener': 'Listener 1', 'Original Text': 'නැහැ මට මේක පලවෙනි වතාවට', 'What did you hear?': 'නහි මට මේක පලවෙනි වතාවට', 'Rating': 5},

    # Listener 2
    {'Listener': 'Listener 2', 'Original Text': 'මට බඩේ අමාරුවක් තියෙනවා', 'What did you hear?': 'මට බඩේ අමාරුවක් තියෙනවා', 'Rating': 5},
    {'Listener': 'Listener 2', 'Original Text': 'මාසයක් විතර වෙනවා', 'What did you hear?': 'මාසයක විහාර වෙනවා', 'Rating': 3},
    {'Listener': 'Listener 2', 'Original Text': 'මට දියවැඩියාව තියෙනවා', 'What did you hear?': 'මට දයිවැඩියාව තියෙනවා', 'Rating': 4},
    {'Listener': 'Listener 2', 'Original Text': 'ඔව් විටමින් පෙති ටිකක් ගන්නවා', 'What did you hear?': 'ඔව් විටමින් ෆයිවු බී ටිකක් ගන්නවා', 'Rating': 1},
    {'Listener': 'Listener 2', 'Original Text': 'ඔව් මට දූවිලි වලට අසාත්මිකතාවයක් තියෙනවා', 'What did you hear?': 'ඔව් මට ජූවිලි වලට අසාත්මිකතාවයක් තියෙනවා', 'Rating': 3},
    {'Listener': 'Listener 2', 'Original Text': 'නැහැ මට මේක පලවෙනි වතාවට', 'What did you hear?': 'නාහි මට මේක පලවෙනි වතාවට', 'Rating': 5},

    # Listener 3
    {'Listener': 'Listener 3', 'Original Text': 'මට බඩේ අමාරුවක් තියෙනවා', 'What did you hear?': 'මට බඩේ අමාරුවක් තියෙනවා', 'Rating': 5},
    {'Listener': 'Listener 3', 'Original Text': 'මාසයක් විතර වෙනවා', 'What did you hear?': 'මසය විහර වයනවා', 'Rating': 2},
    {'Listener': 'Listener 3', 'Original Text': 'මට දියවැඩියාව තියෙනවා', 'What did you hear?': 'මත෦තැඩියාව තියෙනවා', 'Rating': 2},
    {'Listener': 'Listener 3', 'Original Text': 'ඔව් විටමින් පෙති ටිකක් ගන්නවා', 'What did you hear?': 'ඔව් විටමින් පය්ඳි ටිකක් ගන්නවා', 'Rating': 3},
    {'Listener': 'Listener 3', 'Original Text': 'ඔව් මට දූවිලි වලට අසාත්මිකතාවයක් තියෙනවා', 'What did you hear?': 'ඕ මට දූවිලි වලට අසාත්මිකතාවයක් තියෙනවා', 'Rating': 5},
    {'Listener': 'Listener 3', 'Original Text': 'නැහැ මට මේක පලවෙනි වතාවට', 'What did you hear?': 'නෙහි මට මේක පලවෙනි වතවතා', 'Rating': 3},

    # Listener 4
    {'Listener': 'Listener 4', 'Original Text': 'මට බඩේ අමාරුවක් තියෙනවා', 'What did you hear?': 'මට වැඩි අමාරුවක් තියෙනවා', 'Rating': 3},
    {'Listener': 'Listener 4', 'Original Text': 'මාසයක් විතර වෙනවා', 'What did you hear?': 'මසර විහරය බනිනවා', 'Rating': 2},
    {'Listener': 'Listener 4', 'Original Text': 'මට දියවැඩියාව තියෙනවා', 'What did you hear?': 'මට දියවැඩියාව තියෙනවා', 'Rating': 3},
    {'Listener': 'Listener 4', 'Original Text': 'ඔව් විටමින් පෙති ටිකක් ගන්නවා', 'What did you hear?': 'විටමින් පෙති ටිකක් ගන්නවා', 'Rating': 3},
    {'Listener': 'Listener 4', 'Original Text': 'ඔව් මට දූවිලි වලට අසාත්මිකතාවයක් තියෙනවා', 'What did you hear?': 'ඔව් මට දූවිලි වලට අසාත්මිකතාවයක් තියෙනවා', 'Rating': 4},
    {'Listener': 'Listener 4', 'Original Text': 'නැහැ මට මේක පලවෙනි වතාවට', 'What did you hear?': 'පලවෙනි වතාවට', 'Rating': 2},

    # Listener 5
    {'Listener': 'Listener 5', 'Original Text': 'මට බඩේ අමාරුවක් තියෙනවා', 'What did you hear?': 'මට බඩේ අමාරුවක් තියෙයිනවා', 'Rating': 4},
    {'Listener': 'Listener 5', 'Original Text': 'මාසයක් විතර වෙනවා', 'What did you hear?': 'මසය විතර වෙනවා', 'Rating': 4},
    {'Listener': 'Listener 5', 'Original Text': 'මට දියවැඩියාව තියෙනවා', 'What did you hear?': 'මට ඩියවැඩියාව තියෙනවා', 'Rating': 4},
    {'Listener': 'Listener 5', 'Original Text': 'ඔව් විටමින් පෙති ටිකක් ගන්නවා', 'What did you hear?': 'ඔව් විතමින් පෙති තිකක් ගන්නවා', 'Rating': 3},
    {'Listener': 'Listener 5', 'Original Text': 'ඔව් මට දූවිලි වලට අසාත්මිකතාවයක් තියෙනවා', 'What did you hear?': 'ඔව් මට ඩූවිලි වලට අසාත්මිකතාවය තියෙනවා', 'Rating': 4},
    {'Listener': 'Listener 5', 'Original Text': 'නැහැ මට මේක පලවෙනි වතාවට', 'What did you hear?': 'නෙහි මට මේක පලවනි වතවතට', 'Rating': 3},

    # Listener 6
    {'Listener': 'Listener 6', 'Original Text': 'මට බඩේ අමාරුවක් තියෙනවා', 'What did you hear?': 'මට බඩේ අමාරුවක් තියෙනවා', 'Rating': 5},
    {'Listener': 'Listener 6', 'Original Text': 'මාසයක් විතර වෙනවා', 'What did you hear?': 'මසය විතර වයිනවා', 'Rating': 3},
    {'Listener': 'Listener 6', 'Original Text': 'මට දියවැඩියාව තියෙනවා', 'What did you hear?': 'මත දියවයිඩියාව තියෙනවා', 'Rating': 3},
    {'Listener': 'Listener 6', 'Original Text': 'ඔව් විටමින් පෙති ටිකක් ගන්නවා', 'What did you hear?': 'ඔව් විටමින් පයිති ටිකක් ගනවා', 'Rating': 3},
    {'Listener': 'Listener 6', 'Original Text': 'ඔව් මට දූවිලි වලට අසාත්මිකතාවයක් තියෙනවා', 'What did you hear?': 'ඔව් මට දූවිලි වලට අසාත්මිකතාවය තියෙනවා', 'Rating': 5},
    {'Listener': 'Listener 6', 'Original Text': 'නැහැ මට මේක පලවෙනි වතාවට', 'What did you hear?': 'නහියි මට මේක පලවෙයිනි වතාවට', 'Rating': 2},
]

# Load data into DataFrame
df = pd.DataFrame(data)

# Calculate overall MOS
overall_mos = df['Rating'].mean()

# Calculate MOS per Listener
mos_per_listener = df.groupby('Listener')['Rating'].mean()

print(f"Overall MOS: {overall_mos:.2f}\n")
print("MOS per Listener:")
print(mos_per_listener.to_string())
