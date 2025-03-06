import React from "react";
import { format } from "date-fns";
import { Bell, MessageSquare, Phone, Mail, Calendar, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";

interface Activity {
  id: string;
  type: "message" | "call" | "email" | "meeting" | "note";
  title: string;
  description: string;
  timestamp: Date;
  user: {
    name: string;
    avatar?: string;
    initials: string;
  };
}

interface RecentActivitiesProps {
  activities?: Activity[];
}

const RecentActivities = ({
  activities = [
    {
      id: "act1",
      type: "message",
      title: "New message from client",
      description:
        "Discussed upcoming project requirements and timeline expectations.",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      user: {
        name: "Sarah Johnson",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
        initials: "SJ",
      },
    },
    {
      id: "act2",
      type: "call",
      title: "Sales call with prospect",
      description:
        "Presented product demo to potential client. They showed interest in enterprise plan.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      user: {
        name: "Michael Chen",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
        initials: "MC",
      },
    },
    {
      id: "act3",
      type: "email",
      title: "Proposal sent",
      description:
        "Sent detailed proposal with pricing options and implementation timeline.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
      user: {
        name: "Alex Rodriguez",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
        initials: "AR",
      },
    },
    {
      id: "act4",
      type: "meeting",
      title: "Quarterly review meeting",
      description:
        "Discussed account performance and identified growth opportunities.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      user: {
        name: "Emily Wilson",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emily",
        initials: "EW",
      },
    },
    {
      id: "act5",
      type: "note",
      title: "Customer feedback",
      description:
        "Client mentioned interest in additional services. Follow up next week.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      user: {
        name: "David Park",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=david",
        initials: "DP",
      },
    },
  ],
}: RecentActivitiesProps) => {
  // Sort activities by timestamp (newest first)
  const sortedActivities = [...activities].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
  );

  // Function to format relative time
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "just now";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? "s" : ""} ago`;
    } else {
      return format(date, "MMM d, yyyy");
    }
  };

  // Function to get icon based on activity type
  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "message":
        return <MessageSquare className="h-4 w-4" />;
      case "call":
        return <Phone className="h-4 w-4" />;
      case "email":
        return <Mail className="h-4 w-4" />;
      case "meeting":
        return <Calendar className="h-4 w-4" />;
      case "note":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <Card className="w-full h-full bg-white">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-semibold text-gray-800">
          Recent Activities
        </CardTitle>
        <Button size="sm" variant="outline" className="flex items-center gap-1">
          <Plus className="h-4 w-4" /> Add Activity
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
          {sortedActivities.length > 0 ? (
            sortedActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 border-b border-gray-100 pb-4 last:border-0"
              >
                <Avatar className="h-10 w-10 mt-1">
                  <AvatarImage
                    src={activity.user.avatar}
                    alt={activity.user.name}
                  />
                  <AvatarFallback>{activity.user.initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900">
                      {activity.user.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatRelativeTime(activity.timestamp)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1 text-xs"
                    >
                      {getActivityIcon(activity.type)}
                      <span className="capitalize">{activity.type}</span>
                    </Badge>
                    <span className="font-medium text-gray-800">
                      {activity.title}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {activity.description}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No recent activities to display.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivities;
