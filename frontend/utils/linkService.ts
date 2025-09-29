import * as WebBrowser from 'expo-web-browser';
import { Linking, Alert } from 'react-native';

export class LinkService {
  // Open ERP portal in default browser
  static async openERP(): Promise<void> {
    const erpUrl = 'http://erp.bits-pilani.ac.in/';
    
    try {
      console.log('🌐 Opening ERP Portal:', erpUrl);
      
      // Try to open with WebBrowser first (better user experience)
      const result = await WebBrowser.openBrowserAsync(erpUrl, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        controlsColor: '#007AFF',
        toolbarColor: '#ffffff',
      });
      
      console.log('✅ ERP Portal opened successfully:', result.type);
    } catch (error) {
      console.error('❌ Error opening ERP Portal with WebBrowser:', error);
      
      // Fallback to system browser
      try {
        const supported = await Linking.canOpenURL(erpUrl);
        
        if (supported) {
          await Linking.openURL(erpUrl);
          console.log('✅ ERP Portal opened with system browser');
        } else {
          throw new Error('Cannot open URL');
        }
      } catch (fallbackError) {
        console.error('❌ Error opening ERP Portal with system browser:', fallbackError);
        
        Alert.alert(
          'Error',
          'Unable to open ERP Portal. Please check your internet connection and try again.',
          [{ text: 'OK' }]
        );
      }
    }
  }

  // Open any external link
  static async openExternalLink(url: string, title?: string): Promise<void> {
    try {
      console.log(`🌐 Opening external link: ${url}`);
      
      const result = await WebBrowser.openBrowserAsync(url, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        controlsColor: '#007AFF',
        toolbarColor: '#ffffff',
      });
      
      console.log(`✅ ${title || 'External link'} opened successfully:`, result.type);
    } catch (error) {
      console.error(`❌ Error opening ${title || 'external link'}:`, error);
      
      // Fallback to system browser
      try {
        const supported = await Linking.canOpenURL(url);
        
        if (supported) {
          await Linking.openURL(url);
          console.log(`✅ ${title || 'External link'} opened with system browser`);
        } else {
          throw new Error('Cannot open URL');
        }
      } catch (fallbackError) {
        console.error(`❌ Error opening ${title || 'external link'} with system browser:`, fallbackError);
        
        Alert.alert(
          'Error',
          `Unable to open ${title || 'link'}. Please check your internet connection and try again.`,
          [{ text: 'OK' }]
        );
      }
    }
  }

  // Open email client
  static async openEmail(email: string, subject?: string, body?: string): Promise<void> {
    let emailUrl = `mailto:${email}`;
    
    const params = [];
    if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
    if (body) params.push(`body=${encodeURIComponent(body)}`);
    
    if (params.length > 0) {
      emailUrl += `?${params.join('&')}`;
    }
    
    try {
      const supported = await Linking.canOpenURL(emailUrl);
      
      if (supported) {
        await Linking.openURL(emailUrl);
        console.log('✅ Email client opened successfully');
      } else {
        Alert.alert(
          'No Email App',
          'No email application found on your device.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Error opening email client:', error);
      Alert.alert(
        'Error',
        'Unable to open email client.',
        [{ text: 'OK' }]
      );
    }
  }

  // Open phone dialer
  static async openPhone(phoneNumber: string): Promise<void> {
    const phoneUrl = `tel:${phoneNumber}`;
    
    try {
      const supported = await Linking.canOpenURL(phoneUrl);
      
      if (supported) {
        await Linking.openURL(phoneUrl);
        console.log('✅ Phone dialer opened successfully');
      } else {
        Alert.alert(
          'Cannot Make Call',
          'Phone calls are not supported on this device.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Error opening phone dialer:', error);
      Alert.alert(
        'Error',
        'Unable to open phone dialer.',
        [{ text: 'OK' }]
      );
    }
  }
}

export default LinkService;
