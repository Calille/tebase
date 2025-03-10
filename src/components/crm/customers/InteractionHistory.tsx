import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { MessageCircle, Phone, Mail, Calendar, Plus } from "lucide-react";

interface Interaction {
  id: string;
  type: "call" | "email" | "meeting" | "note";
  date: string;
  title: string;
  description: string;
  user: {
    name: string;
    avatar?: string;
    initials: string;
  };
}

interface InteractionHistoryProps {
  customerId?: string;
  interactions?: Interaction[];
}

const InteractionHistory = ({
  customerId = "cust-123",
  interactions = [
    {
      id: "int-1",
      type: "call",
      date: "2023-06-15T10:30:00",
      title: "Follow-up call",
      description:
        "Discussed new product features and gathered feedback on current implementation.",
      user: {
        name: "Alex Johnson",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
        initials: "AJ",
      },
    },
    {
      id: "int-2",
      type: "email",
      date: "2023-06-10T14:45:00",
      title: "Proposal sent",
      description:
        "Sent detailed proposal for enterprise plan upgrade with custom pricing.",
      user: {
        name: "Sarah Miller",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
        initials: "SM",
      },
    },
    {
      id: "int-3",
      type: "meeting",
      date: "2023-06-05T09:00:00",
      title: "Quarterly review",
      description:
        "Conducted quarterly business review with client team. Identified opportunities for expansion.",
      user: {
        name: "Michael Chen",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
        initials: "MC",
      },
    },
    {
      id: "int-4",
      type: "note",
      date: "2023-06-01T16:20:00",
      title: "Customer feedback",
      description:
        "Customer mentioned interest in mobile app integration. Follow up next month.",
      user: {
        name: "Emily Rodriguez",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emily",
        initials: "ER",
      },
    },
  ],
}: InteractionHistoryProps) => {
  // Sort interactions by date (newest first)
  const sortedInteractions = [...interactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  // Function to get icon based on interaction type
  const getInteractionIcon = (type: Interaction["type"]) => {
    switch (type) {
      case "call":
        return <Phone className="h-4 w-4" />;
      case "email":
        return <Mail className="h-4 w-4" />;
      case "meeting":
        return <Calendar className="h-4 w-4" />;
      case "note":
        return <MessageCircle className="h-4 w-4" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }) +
      " at " +
      date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  return (
    <Card className="w-full bg-white">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-semibold text-gray-800">
          Interaction History
        </CardTitle>
        <Button size="sm" className="flex items-center gap-1">
          <Plus className="h-4 w-4" /> Add Interaction
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedInteractions.length > 0 ? (
            sortedInteractions.map((interaction) => (
              <div
                key={interaction.id}
                className="flex items-start gap-4 border-b border-gray-100 pb-4"
              >
                <Avatar className="h-10 w-10 mt-1">
                  <AvatarImage
                    src={interaction.user.avatar}
                    alt={interaction.user.name}
                  />
                  <AvatarFallback>{interaction.user.initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">
                      {interaction.user.name}
                    </span>
                    <span className="text-gray-500 text-sm">•</span>
                    <span className="text-gray-500 text-sm">
                      {formatDate(interaction.date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {getInteractionIcon(interaction.type)}
                      <span className="capitalize">{interaction.type}</span>
                    </Badge>
                    <span className="font-medium text-gray-800">
                      {interaction.title}
                    </span>
                  </div>
                  <p className="text-gray-600">{interaction.description}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No interaction history available for this customer.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InteractionHistory;
