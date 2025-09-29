import { Share, Alert } from 'react-native';

export interface ShareableItem {
  id: string;
  type: 'post' | 'event' | 'project' | 'club' | 'profile';
  title: string;
  content?: string;
  url?: string;
  user?: {
    name: string;
    avatar?: string;
  };
  location?: string;
  date?: string;
  time?: string;
}

export class ShareService {
  private static baseUrl = 'https://networkx.app'; // Replace with your actual app URL

  static async shareItem(item: ShareableItem): Promise<boolean> {
    try {
      const shareContent = this.generateShareContent(item);
      
      const result = await Share.share({
        message: shareContent.message,
        url: shareContent.url,
        title: shareContent.title,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // Shared via activity type
          console.log(`Shared via ${result.activityType}`);
        } else {
          // Shared
          console.log('Content shared successfully');
        }
        return true;
      } else if (result.action === Share.dismissedAction) {
        // Dismissed
        console.log('Share dismissed');
        return false;
      }
      return false;
    } catch (error) {
      console.error('Error sharing content:', error);
      Alert.alert('Share Error', 'Unable to share content at this time.');
      return false;
    }
  }

  private static generateShareContent(item: ShareableItem): {
    title: string;
    message: string;
    url: string;
  } {
    const itemUrl = `${this.baseUrl}/${item.type}/${item.id}`;
    
    switch (item.type) {
      case 'post':
        return {
          title: `Check out this post by ${item.user?.name}`,
          message: `"${item.title}"\n\n${item.content ? item.content.substring(0, 100) + '...' : ''}\n\nShared via NetworkX`,
          url: itemUrl,
        };

      case 'event':
        return {
          title: `Join me at ${item.title}`,
          message: `🎉 ${item.title}\n📅 ${item.date} ${item.time ? `at ${item.time}` : ''}\n📍 ${item.location || 'Location TBA'}\n\n${item.content ? item.content.substring(0, 100) + '...' : ''}\n\nJoin via NetworkX`,
          url: itemUrl,
        };

      case 'project':
        return {
          title: `Collaborate on ${item.title}`,
          message: `🚀 ${item.title}\nBy ${item.user?.name}\n\n${item.content ? item.content.substring(0, 100) + '...' : ''}\n\nCollaborate via NetworkX`,
          url: itemUrl,
        };

      case 'club':
        return {
          title: `Join ${item.title}`,
          message: `🏛️ ${item.title}\n📍 ${item.location || 'Online'}\n\n${item.content ? item.content.substring(0, 100) + '...' : ''}\n\nJoin via NetworkX`,
          url: itemUrl,
        };

      case 'profile':
        return {
          title: `Connect with ${item.user?.name}`,
          message: `👤 ${item.user?.name}\n${item.title}\n\n${item.content ? item.content.substring(0, 100) + '...' : ''}\n\nConnect via NetworkX`,
          url: itemUrl,
        };

      default:
        return {
          title: 'Check this out on NetworkX',
          message: `${item.title}\n\n${item.content ? item.content.substring(0, 100) + '...' : ''}\n\nShared via NetworkX`,
          url: itemUrl,
        };
    }
  }

  static async shareProfile(user: {
    id: string;
    name: string;
    bio?: string;
    major?: string;
    university?: string;
  }): Promise<boolean> {
    const profileItem: ShareableItem = {
      id: user.id,
      type: 'profile',
      title: `${user.major ? `${user.major} student` : 'Student'} at ${user.university || 'University'}`,
      content: user.bio,
      user: { name: user.name },
    };

    return this.shareItem(profileItem);
  }

  static async sharePost(post: {
    id: string;
    content: string;
    user: { name: string; avatar?: string };
  }): Promise<boolean> {
    const postItem: ShareableItem = {
      id: post.id,
      type: 'post',
      title: post.content.substring(0, 50) + (post.content.length > 50 ? '...' : ''),
      content: post.content,
      user: post.user,
    };

    return this.shareItem(postItem);
  }

  static async shareEvent(event: {
    id: string;
    title: string;
    content?: string;
    location?: string;
    date?: string;
    time?: string;
    organizer?: { name: string };
  }): Promise<boolean> {
    const eventItem: ShareableItem = {
      id: event.id,
      type: 'event',
      title: event.title,
      content: event.content,
      location: event.location,
      date: event.date,
      time: event.time,
      user: event.organizer,
    };

    return this.shareItem(eventItem);
  }

  static async shareProject(project: {
    id: string;
    title: string;
    content?: string;
    user?: { name: string };
  }): Promise<boolean> {
    const projectItem: ShareableItem = {
      id: project.id,
      type: 'project',
      title: project.title,
      content: project.content,
      user: project.user,
    };

    return this.shareItem(projectItem);
  }

  static async shareClub(club: {
    id: string;
    title: string;
    content?: string;
    location?: string;
  }): Promise<boolean> {
    const clubItem: ShareableItem = {
      id: club.id,
      type: 'club',
      title: club.title,
      content: club.content,
      location: club.location,
    };

    return this.shareItem(clubItem);
  }

  // Quick share methods for common scenarios
  static async quickShareText(text: string, title?: string): Promise<boolean> {
    try {
      const result = await Share.share({
        message: text,
        title: title || 'Shared from NetworkX',
      });

      return result.action === Share.sharedAction;
    } catch (error) {
      console.error('Error sharing text:', error);
      return false;
    }
  }

  static async shareAppInvite(): Promise<boolean> {
    const inviteMessage = `🎓 Join me on NetworkX - the ultimate student networking platform!\n\nConnect with classmates, find study groups, collaborate on projects, and discover campus events.\n\nDownload now: ${this.baseUrl}`;
    
    return this.quickShareText(inviteMessage, 'Join NetworkX');
  }
}
