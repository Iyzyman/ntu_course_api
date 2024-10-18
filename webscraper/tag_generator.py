from keybert import KeyBERT
import pandas as pd
import nltk
from nltk import pos_tag
from nltk.tokenize import word_tokenize

nltk.download('punkt')
nltk.download('averaged_perceptron_tagger')

# Load course data
courses_df = pd.read_csv('University_Courses_DataV3.csv')

# Initialize KeyBERT model
kw_model = KeyBERT()

# Function to filter out verbs from the extracted tags
def filter_out_verbs(keywords):
    filtered_keywords = []
    for keyword in keywords:
        tokens = word_tokenize(keyword)
        tags = pos_tag(tokens)
        # Only keep keywords where no token is tagged as a verb (VB, VBD, VBG, etc.)
        if all(tag not in ['VB', 'VBD', 'VBG', 'VBN', 'VBP', 'VBZ'] for word, tag in tags):
            filtered_keywords.append(keyword)
    return filtered_keywords

# Function to generate tags using KeyBERT and filter out verbs
def generate_keybert_tags(description):
    if isinstance(description, str):
        # Extract keywords using KeyBERT, limit to top 5 phrases with max 2 words
        keywords = kw_model.extract_keywords(description, keyphrase_ngram_range=(1, 2), stop_words='english', top_n=5)
        keywords = [kw[0] for kw in keywords]  # Extract only the keywords, without scores
        return filter_out_verbs(keywords)  # Filter out keywords that contain verbs
    else:
        return []  # Return empty list if description is invalid

# Apply the generate_keybert_tags function to each course description
courses_df['Tags'] = courses_df['Description'].apply(generate_keybert_tags)

# Save the new dataframe with tags to a new CSV
courses_df.to_csv('keybert_tags_filtered.csv', index=False)

# Display the resulting tags for each course
print(courses_df[['Course Title', 'Tags']])
