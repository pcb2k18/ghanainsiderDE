#!/usr/bin/env python3
"""
Extract all Wayback Machine archive URLs for ghanainsider.com/de
"""

import requests
import json
from datetime import datetime
from typing import List, Dict
import time

class WaybackExtractor:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.cdx_api = "http://web.archive.org/cdx/search/cdx"

    def get_snapshots(self, filters: Dict = None) -> List[str]:
        """
        Fetch all archive snapshots from CDX API

        Args:
            filters: Optional filters (statuscode, mimetype, etc.)
        """
        params = {
            'url': f'{self.base_url}/*',
            'output': 'json',
            'fl': 'timestamp,original',  # Just get essential fields
        }

        # Add filters as separate parameters
        if filters:
            for key, value in filters.items():
                params[f'filter'] = f'{key}:{value}'

        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }

        print(f"Querying Wayback Machine CDX API for: {self.base_url}")
        print(f"This may take a while for large archives...\n")

        # Try multiple approaches
        api_urls = [
            'https://web.archive.org/cdx/search/cdx',
            'http://web.archive.org/cdx/search/cdx',
        ]

        for api_url in api_urls:
            try:
                print(f"Trying: {api_url}")
                response = requests.get(api_url, params=params, headers=headers, timeout=120)
                response.raise_for_status()

                data = response.json()

                # Skip header row
                if len(data) > 0:
                    data = data[1:]

                print(f"✓ Found {len(data)} snapshots!\n")
                return data

            except requests.exceptions.RequestException as e:
                print(f"Failed: {e}")
                continue

        print("All API attempts failed. Trying text format...")
        return self._get_snapshots_text(params, headers)

    def _get_snapshots_text(self, params: Dict, headers: Dict) -> List[List[str]]:
        """Fallback: Try getting data as text format"""
        params['output'] = 'text'

        try:
            response = requests.get('https://web.archive.org/cdx/search/cdx',
                                  params=params, headers=headers, timeout=120)
            response.raise_for_status()

            lines = response.text.strip().split('\n')
            data = []
            for line in lines:
                parts = line.split()
                if len(parts) >= 2:
                    data.append(parts)

            print(f"✓ Found {len(data)} snapshots via text format!\n")
            return data

        except Exception as e:
            print(f"Text format also failed: {e}")
            return []

    def format_archive_url(self, timestamp: str, original_url: str) -> str:
        """Convert CDX data to full archive URL"""
        return f"https://web.archive.org/web/{timestamp}/{original_url}"

    def extract_urls(self, output_file: str = 'archive_urls.txt',
                     detailed_output: str = 'archive_details.json',
                     filters: Dict = None):
        """
        Extract all archive URLs and save to files

        Args:
            output_file: Text file with just URLs
            detailed_output: JSON file with metadata
            filters: Optional filters
        """
        snapshots = self.get_snapshots(filters)

        if not snapshots:
            print("No snapshots found!")
            return

        # Prepare data
        archive_urls = []
        detailed_data = []

        for snapshot in snapshots:
            # Handle both formats: [timestamp, original] or [timestamp, original, statuscode, mimetype]
            timestamp = snapshot[0]
            original = snapshot[1]
            statuscode = snapshot[2] if len(snapshot) > 2 else 'N/A'
            mimetype = snapshot[3] if len(snapshot) > 3 else 'N/A'

            archive_url = self.format_archive_url(timestamp, original)
            archive_urls.append(archive_url)

            # Parse timestamp
            try:
                dt = datetime.strptime(timestamp, '%Y%m%d%H%M%S')
                readable_date = dt.strftime('%Y-%m-%d %H:%M:%S')
            except:
                readable_date = timestamp

            detailed_data.append({
                'archive_url': archive_url,
                'original_url': original,
                'timestamp': timestamp,
                'date': readable_date,
                'status_code': statuscode,
                'mime_type': mimetype
            })

        # Save URLs to text file
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write('\n'.join(archive_urls))

        print(f"✓ Saved {len(archive_urls)} URLs to: {output_file}")

        # Save detailed data to JSON
        with open(detailed_output, 'w', encoding='utf-8') as f:
            json.dump(detailed_data, f, indent=2, ensure_ascii=False)

        print(f"✓ Saved detailed metadata to: {detailed_output}")

        # Print sample
        print(f"\nFirst 5 archive URLs:")
        for url in archive_urls[:5]:
            print(f"  {url}")

        if len(archive_urls) > 5:
            print(f"  ... and {len(archive_urls) - 5} more")

        return archive_urls, detailed_data


def main():
    """Main execution"""
    print("=" * 70)
    print("Wayback Machine Archive URL Extractor")
    print("=" * 70)
    print()

    # Configuration
    BASE_URL = "ghanainsider.com/de"

    extractor = WaybackExtractor(BASE_URL)

    # Extract all URLs (no filters to avoid API issues)
    result = extractor.extract_urls(
        output_file='archive_urls.txt',
        detailed_output='archive_details.json',
        filters=None
    )

    if result is None:
        print("\n❌ Failed to extract URLs. Please check the error messages above.")
        return

    urls, details = result

    print("\n" + "=" * 70)
    print("Extraction Complete!")
    print("=" * 70)
    print(f"\nTotal URLs extracted: {len(urls)}")
    print("\nFiles created:")
    print("  - archive_urls.txt     (Plain list of URLs)")
    print("  - archive_details.json (Detailed metadata)")
    print()


if __name__ == "__main__":
    main()
