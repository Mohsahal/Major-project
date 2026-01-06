# Test the "2+ years" fix
import re

def test_year_extraction():
    """Test that '2+ years' is correctly interpreted as requiring 3 years"""
    
    test_cases = [
        ("Full Stack Dev with 2+ years experience", 3, "mid"),  # 2+ = 3 years
        ("Looking for 3-5 years experience", 3, "mid"),
        ("Minimum 5 years required", 5, "senior"),
        ("0-2 years experience", 0, "fresher"),
        ("Fresh graduate with 0-1 year", 0, "fresher"),
    ]
    
    year_patterns = [
        r'(\d+)\s*-\s*(\d+)\s*years?',  # "3-5 years"
        r'(\d+)\+\s*years?',              # "5+ years"
        r'minimum\s*(\d+)\s*years?',      # "minimum 3 years"
        r'(\d+)\s*to\s*(\d+)\s*years?',  # "3 to 7 years"
    ]
    
    print("Testing year extraction logic:")
    print("=" * 60)
    
    for job_text, expected_years, expected_level in test_cases:
        job_text_lower = job_text.lower()
        min_years_required = None
        
        for pattern in year_patterns:
            matches = re.findall(pattern, job_text_lower)
            if matches:
                if isinstance(matches[0], tuple):
                    min_years_required = int(matches[0][0])
                else:
                    min_years_required = int(matches[0])
                    # Check if this is a "+" pattern
                    if '+' in pattern:
                        min_years_required += 1
                break
        
        # Determine level
        if min_years_required is not None:
            if min_years_required == 0:
                level = 'fresher'
            elif min_years_required <= 2:
                level = 'fresher'
            elif min_years_required <= 4:
                level = 'mid'
            else:
                level = 'senior'
        else:
            level = 'unknown'
        
        status = "PASS" if (min_years_required == expected_years and level == expected_level) else "FAIL"
        print(f"\n{status}: \"{job_text}\"")
        print(f"  Expected: {expected_years} years -> {expected_level}")
        print(f"  Got:      {min_years_required} years -> {level}")

if __name__ == "__main__":
    test_year_extraction()
