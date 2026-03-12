import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';


@Injectable()
export class GeoLocationService {
  constructor(private configservice: ConfigService) {}
  //https://us1.locationiq.com/v1/search?key=YOUR_API_KEY&q=Statue%20of%20Liberty,%20New%20York&format=json

  public async getYahooCoordinates(
    address: string,
  ): Promise<{ lat: number; lon: number }> {
    const yourYahooApiKey = this.configservice.get('YAHOO_API_MAPS_KEY');
    const response = await axios.get(
      `https://us1.locationiq.com/v1/search?key=${yourYahooApiKey}&q=${address}&format=json`,
      {},
    );

    if (response.data.length === 0) {
      throw new NotFoundException('No address found for:', address);
    }

    console.log(response.data);
    const { lat, lon } = response.data[0];
    return { lat, lon };
  }

  //extract the long and latitude from a given address/location

  public async GoggleApiCordinates(
    address: string,
  ): Promise<{ lat: number; lng: number }> {
    const maxRetries = 3;
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response: any = await axios.get(
          `https://maps.googleapis.com/maps/api/geocode/json`,
          {
            params: {
              address: address,
              key: this.configservice.get('GOOGLE_MAPS_API'),
            },
            timeout: 5000, // Set a timeout of 5 seconds
          },
        );

        if (response.data.status !== 'OK') {
          throw new Error('Failed to retrieve data from Google Maps API');
        }

        const { lat, lng } = response.data.results[0].geometry.location;
        return { lat, lng };
      } catch (error) {
        if (attempt < maxRetries) {
          console.warn(`Attempt ${attempt} failed. Retrying...`);
          await delay(1000 * attempt); // Exponential backoff
        } else {
          console.error(`All ${maxRetries} attempts failed.`);
          throw new HttpException(
            'Failed to retrieve latitude and longitude',
            HttpStatus.BAD_GATEWAY,
          );
        }
      }
    }
  }
}
